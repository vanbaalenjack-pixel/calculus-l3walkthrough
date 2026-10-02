#!/usr/bin/env python3
"""Regression checks for the October readiness corrections."""
import cmath
import math
from pathlib import Path
import unittest
ROOT = Path(__file__).resolve().parents[1]

class Readiness(unittest.TestCase):
    def test_original_complex_fraction_and_quadrant(self):
        for d, expected in [(-2, 2+2j), (-3, 1.5+1.5j)]:
            z = (d+6j)/(1-d*1j)
            self.assertAlmostEqual(abs(z-expected), 0)
            self.assertAlmostEqual(z.real, -5*d/(1+d*d))
            self.assertAlmostEqual(z.imag, (6+d*d)/(1+d*d))
            self.assertGreater(z.real, 0)
            self.assertGreater(z.imag, 0)
            self.assertAlmostEqual(cmath.phase(z), math.pi/4)
        self.assertNotEqual(( -2+6j)/(1+2j), 10+10j)
        self.assertNotAlmostEqual(cmath.phase(-2-2j), math.pi/4)

    def test_both_explanations_include_the_denominator(self):
        source = (ROOT/'complex-2025-data.js').read_text()
        step = source.split('title: raw`Rationalise the fraction`', 1)[1].split('title:', 1)[0]
        for text in [r'\frac{-5d}{1+d^2}', r'\frac{6+d^2}{1+d^2}',
                     r'1+d^2>0', 'common denominator can be cancelled', 'first quadrant']:
            self.assertEqual(step.count(text), 2, text)
        self.assertNotIn(r'The real part is \(-5d\)', source)

    def test_rectangle_domain_and_stationary_equation(self):
        source = (ROOT/'differentiation-2025-data.js').read_text()
        for x in [1, 3, 7]:
            derivative = -2*math.sqrt(16*x-x*x)+(16-2*x)**2/(2*math.sqrt(16*x-x*x))
            self.assertAlmostEqual(derivative*2*math.sqrt(16*x-x*x), 8*x*x-128*x+256)
        valid, invalid = 8-4*math.sqrt(2), 8+4*math.sqrt(2)
        self.assertTrue(0 < valid < 8)
        self.assertGreater(invalid, 8)
        self.assertAlmostEqual(16-2*valid, 8*math.sqrt(2))
        for text in [r'0&lt;x&lt;8', r'8x^2-128x+256=0', r'x=8\pm4\sqrt{2}', 'negative width', 'assume']:
            self.assertIn(text, source)

    def test_logarithm_notation_preserves_sign_reasoning(self):
        source = (ROOT/'walkthrough-audit-data.js').read_text()
        self.assertNotIn('(ln|y|)', source)
        self.assertNotIn('(ln y)', source)
        for text in [r'\(\ln|y|\)', r'\(\ln y\)', 'absolute-value equation', 'positive branch', 'zero solution']:
            self.assertIn(text, source)

if __name__ == '__main__':
    unittest.main()
