import importlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from dataclasses import replace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from indexing.settings import Settings
from helpers import manifest


class DocumentTests(unittest.TestCase):
    def test_heading_only_sections_are_preserved(self):
        from indexing import documents
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); settings=Settings(root/'data')
            path=manifest(root,'# First heading\n# Second heading')
            sources=documents.prepare_sources(documents.load_manifest(path,settings),settings)
            chunks=documents.chunks_for_sources(sources,settings)
            self.assertEqual([chunk['section'] for chunk in chunks],['First heading','Second heading'])

    def test_real_pdf_pages_and_encrypted_or_empty_pdf_rejection(self):
        from indexing import documents
        from pypdf import PdfWriter
        from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject
        import hashlib
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); settings=Settings(root/'data'); path=manifest(root)
            writer=PdfWriter(); page=writer.add_blank_page(width=612,height=792)
            font=DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})
            page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):font})})
            stream=DecodedStreamObject(); stream.set_data(b'BT /F1 12 Tf 72 720 Td (Approved PDF content) Tj ET')
            page[NameObject('/Contents')]=stream
            pdf=root/'source.pdf'; writer.write(pdf)
            value=json.loads(path.read_text()); value['sources'][0].update(path='source.pdf',format='pdf',sha256=hashlib.sha256(pdf.read_bytes()).hexdigest())
            path.write_text(json.dumps(value))
            sources=documents.prepare_sources(documents.load_manifest(path,settings),settings)
            self.assertIn('Approved PDF content',sources[0]['pages'][0])
            self.assertEqual(documents.chunks_for_sources(sources,settings)[0]['page'],1)
            for encrypted in [False,True]:
                writer=PdfWriter(); writer.add_blank_page(width=612,height=792)
                if encrypted: writer.encrypt('password')
                writer.write(pdf); value['sources'][0]['sha256']=hashlib.sha256(pdf.read_bytes()).hexdigest(); path.write_text(json.dumps(value))
                with self.subTest(encrypted=encrypted),self.assertRaises(ValueError):
                    documents.prepare_sources(documents.load_manifest(path,settings),settings)

    def test_approved_source_is_archived_and_changed_bytes_rejected(self):
        try:
            documents = importlib.import_module('indexing.documents')
        except ImportError:
            self.fail('Approved source preparation is not implemented')
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            settings=Settings(root/'data')
            path=manifest(root)
            value=documents.load_manifest(path,settings)
            sources=documents.prepare_sources(value,settings)
            (root/'source.txt').write_text('changed',encoding='utf-8')
            self.assertIn('info@tansam.in',sources[0]['text'])
            self.assertTrue(Path(sources[0]['archive']).is_file())
            with self.assertRaises(ValueError):
                documents.prepare_sources(value,settings)

    def test_invalid_approval_formats_empty_and_limits_fail(self):
        try:
            documents=importlib.import_module('indexing.documents')
        except ImportError:
            self.fail('Source validation is not implemented')
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); settings=Settings(root/'data')
            path=manifest(root)
            value=json.loads(path.read_text())
            for field,new in [('sha256','0'*64),('approved_by',''),('approved_at','invalid'),('format','docx')]:
                changed=json.loads(json.dumps(value)); changed['sources'][0][field]=new
                path.write_text(json.dumps(changed))
                with self.subTest(field=field),self.assertRaises(ValueError):
                    documents.prepare_sources(documents.load_manifest(path,settings),settings)
            path=manifest(root,'   ')
            with self.assertRaises(ValueError): documents.prepare_sources(documents.load_manifest(path,settings),settings)
            path=manifest(root,'HELLO\n'+'a'*200)
            limited=replace(settings,max_source_bytes=10)
            with self.assertRaises(ValueError): documents.prepare_sources(documents.load_manifest(path,limited),limited)

    def test_chunks_preserve_unicode_sections_and_long_body_coverage(self):
        try:
            documents=importlib.import_module('indexing.documents')
        except ImportError:
            self.fail('Deterministic section chunking is not implemented')
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory); settings=replace(Settings(root/'data'),chunk_size=50,chunk_overlap=10)
            body='தமிழ் '+'abcdefghij'*20
            path=manifest(root,'# CONTACT\n'+body+'\n\n# HOURS\n9 AM to 6 PM')
            sources=documents.prepare_sources(documents.load_manifest(path,settings),settings)
            chunks=documents.chunks_for_sources(sources,settings)
            self.assertEqual(chunks,documents.chunks_for_sources(sources,settings))
            self.assertTrue(any(c['section']=='HOURS' and '9 AM to 6 PM' in c['text'] for c in chunks))
            self.assertTrue(any('தமிழ்' in c['text'] for c in chunks))
            covered=set()
            for chunk in chunks:
                if chunk['section']=='CONTACT': covered.update(range(chunk['start'],chunk['end']))
                self.assertLessEqual(chunk['end']-chunk['start'],50)
            self.assertTrue(set(range(len(body))).issubset(covered))


if __name__=='__main__': unittest.main()
