import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from helpers import EmbeddingServer, manifest

BACKEND=Path(__file__).resolve().parents[1]


class CLITests(unittest.TestCase):
    def run_cli(self,root,*args,**extra):
        env={**os.environ,'TANSY_ENV':'test','TANSY_DATA_ROOT':str(root/'data'),'TANSY_MIN_FREE_BYTES':'0',**extra}
        return subprocess.run([sys.executable,str(BACKEND/'ingest_tansam.py'),*args],cwd=root,env=env,capture_output=True,text=True,timeout=30)

    def test_cli_build_is_json_and_does_not_publish_implicitly(self):
        with tempfile.TemporaryDirectory() as directory,EmbeddingServer() as server:
            root=Path(directory); path=manifest(root)
            result=self.run_cli(root,'build','--manifest',str(path),TANSY_OLLAMA_URL=server.url)
            self.assertEqual(result.returncode,0,result.stderr+result.stdout)
            value=json.loads(result.stdout)
            self.assertEqual(value['state'],'ready')
            status=self.run_cli(root,'status','--kb','tansam')
            self.assertEqual(json.loads(status.stdout)['active']['generation'],0)
            bad=self.run_cli(root,'validate','--manifest',str(root/'missing.json'))
            self.assertEqual(bad.returncode,2)
            self.assertEqual(json.loads(bad.stdout)['error'],'manifest')

    def test_chat_import_has_no_database_side_effect_and_missing_index_returns_503(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            code='''
from pathlib import Path
import services.rag
assert not Path('chroma_db').exists(), 'Import created a legacy database'
from app import app
from unittest.mock import patch
with patch('routes.chat.ollama_chat_stream',side_effect=AssertionError('generation must not run')):
    response=app.test_client().post('/api/public/chat',json={'message':'email?'},buffered=True)
    assert response.status_code==503, response.status_code
    assert response.get_json()['error']=='knowledge_unavailable'
print('safe')
'''
            env={**os.environ,'PYTHONPATH':str(BACKEND),'TANSY_ENV':'test','TANSY_DATA_ROOT':str(root/'data')}
            result=subprocess.run([sys.executable,'-c',code],cwd=root,env=env,capture_output=True,text=True,timeout=30)
            self.assertEqual(result.returncode,0,result.stdout+result.stderr)


if __name__=='__main__': unittest.main()
