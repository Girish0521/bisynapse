"""Regression checks for byte-stable corpus output on Windows and Linux."""
import json
import tempfile
import unittest
from pathlib import Path
from authentic_pipeline import save, validate


class CorpusPortabilityTests(unittest.TestCase):
    def test_json_writer_preserves_lf_and_unicode(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'document.json'
            value = {'text': 'నీరు\nपानी'}
            save(target, value)
            expected = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
            self.assertEqual(target.read_bytes(), expected)
            self.assertNotIn(b'\r\n', target.read_bytes())

    def test_checked_out_dataset_integrity(self):
        validate()


if __name__ == '__main__':
    unittest.main()
