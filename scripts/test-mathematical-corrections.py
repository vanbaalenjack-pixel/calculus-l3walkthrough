#!/usr/bin/env python3
"""Independent substitutions, geometry and boundary checks, separate from rendering QA."""
import cmath
import math
from fractions import Fraction as F
from pathlib import Path
import unittest
ROOT = Path(__file__).resolve().parents[1]

def multiply(a,b):
    out=[0]*(len(a)+len(b)-1)
    for i,x in enumerate(a):
        for j,y in enumerate(b):out[i+j]+=x*y
    return out

class Corrections(unittest.TestCase):
    def test_cubic_expansion_and_original_roots(self):
        self.assertEqual(multiply([2,1],[26,-10,1]),[52,6,-8,1])
        for z in [5-1j,5+1j,-2]:self.assertAlmostEqual(abs(z**3-8*z*z+6*z+52),0)
        self.assertGreater(abs((5-1j)**3-8*(5-1j)**2+26*(5-1j)+52),1)
    def test_tangent_distance_contact_and_quadratic(self):
        # Distance from (2,-1) to mx-y-1=0 equals sqrt(3).
        m=math.sqrt(3)
        self.assertAlmostEqual(abs(2*m)/math.hypot(m,1),math.sqrt(3))
        x,y=.5,m*.5-1
        self.assertAlmostEqual((x-2)**2+(y+1)**2,3)
        self.assertAlmostEqual((x-2)+m*(y+1),0) # radius perpendicular to tangent
        self.assertAlmostEqual(16-4*(1+m*m),0)
        self.assertAlmostEqual((1+m*m)*x*x-4*x+1,0)
    def test_original_implicit_de_and_derivative_mismatch(self):
        for x in map(F,[-3,0,1,2,4,5,6,8]):
            y=(2-x)/3;yp=F(-1,3)
            self.assertEqual((1-x*x)*(1+y)*yp+(1-x)*(1-y*y),0)
        self.assertEqual((2-F(6))/3,F(-4,3))
        h=F(1,10000)
        self.assertEqual(((2-(5-h))/3+1)/(-h),F(-1,3))
        self.assertNotEqual(F(-1,3),0) # constant right-hand continuation cannot be differentiable
    def test_principal_complex_radicals_include_negative_parameters(self):
        for a in [-100,-3,-1,-.01,0,.01,1,3,100]:
            self.assertAlmostEqual(abs(cmath.sqrt(12*a)-2*cmath.sqrt(3*a)),0)
            original=(cmath.sqrt(3*a)-1j*cmath.sqrt(12*a))**2
            self.assertAlmostEqual(abs(original-(-9*a-12*a*1j)),0)
        self.assertNotEqual(math.sqrt(36),6*(-1))
    def test_real_radical_sign(self):
        for y in [-5,-1,-.2,0,.2,1,5]:
            original=5*y*math.sqrt(y**6/64)
            self.assertAlmostEqual(original,5*y*abs(y**3)/8)
            if y<0:self.assertNotEqual(original,5*y**4/8)
        self.assertEqual(5*(-1)*math.sqrt(1/64),-5/8)
    def test_radical_quotient_domain_and_common_factor(self):
        for p in [-20,-1,-.01,.01,1,20]:
            self.assertAlmostEqual(abs(cmath.sqrt(2*p)-math.sqrt(2)*cmath.sqrt(p)),0)
            value=cmath.sqrt(2*p)/(cmath.sqrt(2*p)-cmath.sqrt(p))
            self.assertAlmostEqual(abs(value-(2+math.sqrt(2))),0)
        self.assertEqual(cmath.sqrt(0)-cmath.sqrt(0),0)
    def test_2021_de_interval_and_formal_evaluation(self):
        x0=3*math.pi/8
        self.assertAlmostEqual(math.tan(2*x0)+5,4)
        left=(math.pi-math.atan(5))/2;right=3*math.pi/4
        self.assertLess(left,x0);self.assertLess(x0,right);self.assertLess(right,math.pi)
        self.assertAlmostEqual(math.tan(2*left)+5,0)
        self.assertAlmostEqual(math.cos(2*right),0)
        for x in [.9,1.1,1.5,2.0]:
            y=math.sqrt(math.tan(2*x)+5);yp=1/(math.cos(2*x)**2*y)
            self.assertAlmostEqual(2*y*yp,2/math.cos(2*x)**2)
        self.assertAlmostEqual(math.tan(2*math.pi)+5,5)
    def test_2022_de_interval_and_formal_evaluation(self):
        self.assertAlmostEqual(math.log(2-1)-1,-1)
        self.assertAlmostEqual(math.log((1+math.e)-1)-1,0)
        self.assertAlmostEqual(math.log((1+math.e**2)-1)-1,1)
        self.assertLess(2,1+math.e);self.assertLess(1+math.e,1+math.e**2)
        self.assertEqual(3*0**2*math.e,0) # original denominator at the intervening point
    def test_vertical_tangent_cases(self):
        for p in [-4,4]:
            q=0
            self.assertEqual(p*p+q*q,16)
            for y in [-10,0,10]:self.assertEqual(p*p+q*y,p*p+q*q)
            self.assertEqual(p*0+q*4,0) # radius is perpendicular to vertical tangent vector
    def test_negative_polar_parameter_and_zero_denominator(self):
        for m in [-4,-1,1,4]:
            z=m**3*cmath.exp(2j*math.pi/15)
            angle=2*math.pi/15 if m>0 else -13*math.pi/15
            self.assertAlmostEqual(abs(z-abs(m)**3*cmath.exp(1j*angle)),0)
            self.assertGreater(abs(m)**3,0)
    def test_original_rational_expression_exclusions(self):
        for x in [F(-5),F(2,5)]:self.assertEqual(5*x*x+23*x-10,0)
        for x in [F(-3),F(0),F(1),F(5)]:
            self.assertEqual((6*x**3+26*x*x-20*x)/(5*x*x+23*x-10),2*x*(3*x-2)/(5*x-2))
    def test_radius_of_curvature_absolute_value(self):
        x=math.pi/3;yp=-2*math.sin(4*x);ypp=-8*math.cos(4*x)
        self.assertGreater(ypp,0);self.assertAlmostEqual((1+yp*yp)**1.5/abs(ypp),2)
        self.assertLess(-8*math.cos(0),0) # signed formula is not a nonnegative radius generally
    def test_positive_2020_ivp_branch(self):
        for x in [math.pi/4,math.pi/3]:
            y=math.sqrt(4+2*math.log(math.tan(x)))
            yp=1/(y*math.sin(x)*math.cos(x))
            self.assertAlmostEqual(math.tan(x)*yp,1/(math.cos(x)**2*y))
        self.assertAlmostEqual(math.sqrt(4+2*math.log(math.tan(math.pi/3))),math.sqrt(4+math.log(3)))
    def test_volume_rate_and_decrease_magnitude(self):
        signed_rate=4*math.pi*6**2*(-.05)
        self.assertAlmostEqual(signed_rate,-36*math.pi/5)
        self.assertAlmostEqual(abs(signed_rate),36*math.pi/5)
    def test_standalone_curve_and_area(self):
        def curve(x):return 7-4/x**2
        def primitive(x):return 7*x+4/x
        self.assertEqual(curve(1),3);self.assertEqual(primitive(2)-primitive(1),5)
        for x in [1,1.5,2]:
            h=1e-5
            self.assertAlmostEqual((curve(x+h)-curve(x-h))/(2*h),8/x**3,places=7)
    def test_2023_exponential_product_derivative(self):
        for t in [-2,-.3,0,1.5,3]:
            h=1e-5
            f=lambda u:u*u*math.exp(2*u)
            self.assertAlmostEqual((f(t+h)-f(t-h))/(2*h),2*t*math.exp(2*t)*(1+t),delta=1e-5)
        source=(ROOT/'differentiation-2023-data.js').read_text()
        part=source.split('"1b": createConfig',1)[1].split('"1c": createConfig',1)[0]
        self.assertNotIn(r"\sec",part)
    def test_2021_graph_horizontal_ray_and_corner(self):
        def left_graph(x):return 1 if x<=2 else x-1
        h=1e-5
        for x in [-10,0,1.5]:
            self.assertEqual((left_graph(x+h)-left_graph(x-h))/(2*h),0)
        self.assertAlmostEqual((left_graph(2)-left_graph(2-h))/h,0)
        self.assertAlmostEqual((left_graph(2+h)-left_graph(2))/h,1)
        source=(ROOT/'differentiation-2021-data.js').read_text()
        part=source.split('"1b": createConfig',1)[1].split('"1c": createConfig',1)[0]
        self.assertIn(r"x\lt2",part)
        self.assertIn('corner has no derivative',part)
    def test_reviewed_complex_and_algebra_parameter_results_by_substitution(self):
        # Parameter families checked against unsimplified equations, including negative cases.
        for k in [-3,-.25,.25,3]:
            for x in [3*k+k*math.sqrt(10),3*k-k*math.sqrt(10)]:self.assertAlmostEqual(x*x-6*k*x,k*k)
            self.assertAlmostEqual(abs(1j/(2*k+1j)-(1+2*k*1j)/(4*k*k+1)),0)
            x=9/(4*abs(k));self.assertAlmostEqual(4-math.sqrt(abs(k)*x),math.sqrt(abs(k)*x+4))
        for g,h in [(4,-7),(F(14,3),-6)]:self.assertAlmostEqual(abs((g+2j)*(3+h*1j)-(10-4j)*(3-1j)),0)
        for d in [-2,-3]:self.assertAlmostEqual(cmath.phase((d+6j)/(1-d*1j)),math.pi/4)
        for d in [1,9]:self.assertAlmostEqual(abs((3+d*1j).conjugate()-10*d/(3+d*1j)),0)
        for d in [1,5]:self.assertAlmostEqual(abs((3+d*1j)-1-7j),2*abs((3+d*1j)-4-4j))
        self.assertEqual(multiply([2,-2,1],[-4,3]),[-8,14,-10,3])
        self.assertEqual(multiply([40,-12,1],[-5,2]),[-200,140,-29,2])
        for x in [4,9]:self.assertAlmostEqual(2*math.log(x+6,5)-math.log(x,5)-2,0)
        self.assertEqual(F(1,5)**2*15+F(1,5)*7-2,0)
        self.assertEqual(F(-2,3)**2*15+F(-2,3)*7-2,0)
        self.assertEqual((-10)**2+2*5*(-7),6*5)

if __name__=='__main__':unittest.main(verbosity=2)
