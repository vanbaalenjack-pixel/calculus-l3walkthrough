#!/usr/bin/env python3
"""Focused regressions for the presentation release and its publication boundary."""
import importlib.util
import json
import math
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    value = importlib.util.module_from_spec(spec); sys.modules[name] = value; spec.loader.exec_module(value)
    return value
seo = module('presentation_seo', 'build-seo.py')
public = module('presentation_public', 'build-public.py')

class PresentationRelease(unittest.TestCase):
    def test_circle_geometry_and_tangent_independently(self):
        r = math.sqrt(3); m = r
        # Distance from (2,-1) to mx-y-1=0 is the radius.
        self.assertAlmostEqual(abs(2*m) / math.sqrt(m*m+1), r)
        x = 2 / (1+m*m); y = m*x - 1
        self.assertAlmostEqual((x-2)**2+(y+1)**2, 3)
        self.assertAlmostEqual((1+m*m)*x*x-4*x+1, 0)
        self.assertAlmostEqual(16-4*(1+m*m), 0)
        text = (ROOT/'complex-2023-data.js').read_text().split('"2e": createConfig',1)[1].split('"3a": createConfig',1)[0]
        self.assertNotIn(r'radius is \(3\)',text)
        self.assertIn(r'radius is \(\sqrt{3}\)',text)
        self.assertIn(r'(x-2)^2+(y+1)^2=3',text)

    def test_maximum_does_not_imply_strict_second_derivative(self):
        for x in [-0.1, 0.1]: self.assertLess(-x**4, 0)
        self.assertEqual(-12*0**2, 0)
        text = (ROOT/'differentiation-2023-data.js').read_text().split('"3b": createConfig',1)[1].split('"3c": createConfig',1)[0]
        self.assertNotIn('local maximum, so',text)
        self.assertIn('horizontal tangent',text)
        self.assertIn('concave-down shape shown',text)

    def test_previous_cubic_and_tangent_solutions_survive(self):
        for z in [-2,5+1j,5-1j]: self.assertAlmostEqual(abs(z**3-8*z**2+6*z+52),0)
        for x,y in [(-6,-18),(-2,2)]:
            self.assertAlmostEqual(x*x/(x+4),y)
            self.assertAlmostEqual(x*(x+8)/(x+4)**2,-3)
            self.assertNotEqual(x,-4)

    def test_new_unlisted_files_cannot_enter_release(self):
        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory)/'public'
            with patch.object(public,'OUTPUT',destination): public.build()
            expected = public.publication_inputs() | {'.nojekyll'}
            actual = {p.relative_to(destination).as_posix() for p in destination.rglob('*') if p.is_file()}
            self.assertEqual(actual,expected)
            for name in ['READINESS_FIXES_2026-10-02.md','scripts/test_build_seo_contract.py',
                         'assets/development.js','assets/private.map','.review/2026-10-12/release-report.md']:
                self.assertNotIn(name,actual)
            self.assertIn('assets/katex/LICENSE',actual)

    def test_icon_directory_matches_embedded_bitmap_and_length(self):
        data = (ROOT/'favicon.ico').read_bytes()
        self.assertEqual(struct.unpack_from('<HHH',data),(0,1,1))
        width,height,_,_,planes,bpp,size,offset=struct.unpack_from('<BBBBHHII',data,6)
        header,w,h,dibplanes,dibbits=struct.unpack_from('<IiiHH',data,offset)
        self.assertEqual((width,height,planes,bpp),(48,48,1,32))
        self.assertEqual((header,w,h,dibplanes,dibbits),(40,48,96,1,32))
        self.assertEqual(size,len(data)-offset)
        self.assertGreaterEqual(size,40+48*48*4+48*8)

    def test_skill_labels_are_authoritative_and_complete(self):
        catalogue=seo.load_catalogue(); routes=seo.discover_routes(catalogue)
        enriched=seo.enrich_catalogue(catalogue,routes)
        labels=enriched['skillLabels']
        self.assertEqual(labels,{slug:spec.short_label for slug,spec in seo.SKILL_SPECS.items()})
        for level in enriched['levels']:
            for standard in level['standards']:
                for paper in standard['papers']:
                    for question in paper['questions']:
                        self.assertTrue(question['skillSlugs'])
                        for slug in question['skillSlugs']: self.assertIn(slug,labels)
        self.assertEqual(labels['definite-integrals-area'],'Definite integrals and area')

    def test_about_revision_and_home_notice_regenerate_consistently(self):
        about=seo.about_page(); home=seo.update_homepage((ROOT/'index.html').read_text())
        self.assertNotIn('github.com/vanbaalenjack-pixel',about)
        self.assertIn('datetime="2026-10-12"',about)
        self.assertIn('not affiliated with or endorsed by NZQA',about)
        self.assertEqual(home.count('Calc.nz is an independent learning resource'),1)
        self.assertIn('Report an error or issue',home)
        self.assertEqual(home,seo.update_homepage(home))

if __name__ == '__main__': unittest.main()
