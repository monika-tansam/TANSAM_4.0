"""Stable public errors; upstream credentials and response bodies stay private."""


class IndexingError(ValueError):
    def __init__(self, code, message, job_id=None):
        super().__init__(message)
        self.code, self.job_id = code, job_id

    def as_dict(self):
        return {'error': self.code, 'message': str(self), 'job_id': self.job_id}
