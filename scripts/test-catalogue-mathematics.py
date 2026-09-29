#!/usr/bin/env python3
"""Independent numerical/analytic checks for a cross-paper sample; not teacher review."""
import math as m
import unittest
from fractions import Fraction as F

def derivative(f,x):
    h=1e-5*max(1,abs(x))
    return (f(x-2*h)-8*f(x-h)+8*f(x+h)-f(x+2*h))/(12*h)
def integral(f,a,b,n=4000):
    h=(b-a)/n
    return h/3*(f(a)+f(b)+4*sum(f(a+i*h) for i in range(1,n,2))+2*sum(f(a+i*h) for i in range(2,n,2)))

# Primitive candidates are differentiated numerically against the original integrand.
PRIMITIVES=[
 ('int-1a2017.html',lambda x:4/m.cos(2*x)**2,lambda x:2*m.tan(2*x),[.1,.3]),
 ('int-2a2017.html',lambda x:6/(2*x-1),lambda x:3*m.log(abs(2*x-1)),[-2,2]),
 ('int-2b2017.html',lambda x:(2*x-5)**4,lambda x:(2*x-5)**5/10,[1,3]),
 ('int-3a2017.html',lambda x:9/x**4+8*m.exp(4*x),lambda x:-3/x**3+2*m.exp(4*x),[-1,.5]),
 ('int-1a2018.html',lambda x:6*x-8/x**3,lambda x:3*x*x+4/x**2,[-2,2]),
 ('int-2a2018.html',lambda x:1/m.cos(x)**2+m.sin(2*x)/m.cos(2*x)**2,lambda x:m.tan(x)+.5/m.cos(2*x),[-.3,.3]),
 ('int-3a2018.html',lambda x:(4*x)**2+4*x+4/x,lambda x:16*x**3/3+2*x*x+4*m.log(abs(x)),[-2,2]),
 ('int-1a2019.html',lambda x:2+2/m.sqrt(x),lambda x:2*x+4*m.sqrt(x),[.25,3]),
 ('int-2a2019.html',lambda x:1+2*m.exp(4*x),lambda x:x+m.exp(4*x)/2,[-1,.5]),
 ('int-3a2019.html',lambda x:24*(2*x-1)**3,lambda x:3*(2*x-1)**4,[-1,2]),
 ('int-1a2020.html',lambda x:x+2+3/x,lambda x:x*x/2+2*x+3*m.log(abs(x)),[-2,2]),
 ('int-2a2020.html',lambda x:m.pi-2/x**2,lambda x:m.pi*x+2/x,[-2,2]),
 ('int-3a2020.html',lambda x:m.sin(2*x)/m.cos(2*x)**2,lambda x:.5/m.cos(2*x),[-.2,.2]),
 ('int-1a2021.html',lambda x:x/3+3/x,lambda x:x*x/6+3*m.log(abs(x)),[-2,2]),
 ('int-2a2021.html',lambda x:m.exp(4*x)+4*m.sqrt(x),lambda x:m.exp(4*x)/4+8*x**1.5/3,[.25,.5]),
 ('int-3a2021.html',lambda x:(x+m.sqrt(x))**2,lambda x:x**3/3+x*x/2+4*x**2.5/5,[.25,2]),
 ('int-1a2022.html',lambda x:4/x-1/m.cos(x)**2,lambda x:4*m.log(abs(x))-m.tan(x),[-.5,.5]),
 ('int-2a2022.html',lambda x:m.exp(3*x)-m.sqrt(x),lambda x:m.exp(3*x)/3-2*x**1.5/3,[.25,.5]),
 ('int-3a2022.html',lambda x:(2*x+5)**3,lambda x:(2*x+5)**4/8,[-3,2]),
]
AREAS=[
 ('int-1b2017.html',lambda x:x+1/m.sqrt(x),1,4,9.5),
 ('int-2d2017.html',lambda x:m.sin(3*x)*m.cos(2*x),0,m.pi/4,(3-m.sqrt(2))/5),
 ('int-3c2017.html',lambda x:(15*x-15)/(x+2),1,11,150-45*m.log(13/3)),
 ('int-1c2018.html',lambda x:(2*x-7)/(x-5),6,8,4+3*m.log(3)),
 ('int-3e2018.html',lambda x:(2*x-1)**4, .5,1,.1), # curve area minus tangent triangle = 3/80
 ('int-1c2019.html',lambda x:m.cos(4*x)*m.cos(2*x),0,m.pi/12,5/24),
 ('int-2d2019.html',lambda x:m.cos(x)**2,0,m.pi,m.pi/2),
 ('int-2e2019.html',lambda x:20-2*m.exp(2*x),0,m.log(10)/2,10*m.log(10)-9),
 ('int-3c2019.html',lambda x:x+1+x/(x+1),1,4,13.5-m.log(2.5)),
 ('int-1c2020.html',lambda x:(5*x-11)/(x-3),4,8,20+4*m.log(5)),
 ('int-1d2020.html',lambda x:4-x-3/x,1,3,4-3*m.log(3)),
 ('int-3e2020.html',lambda x:m.cos(x)-m.cos(x)**3,0,m.pi/2,1/3),
 ('int-2c2021.html',lambda x:m.sin(6*x)*m.sin(2*x),0,m.pi/8,1/8),
 ('int-3d2021.html',lambda x:(3*x-2)/(x+2),2,6,12-8*m.log(2)),
 ('int-1c2022.html',lambda x:m.sin(2*x)**2,0,m.pi/4,m.pi/8),
 ('int-1e2022.html',lambda x:3*m.exp(x)+10-m.exp(2*x),0,m.log(5),10*m.log(5)),
 ('int-3c2022.html',lambda x:(4*x-5)/(x-3),5,8,12+7*m.log(2.5)),
 ('int-3d2022.html',lambda x:(x+m.cos(x))-x,-m.pi/2,m.pi/2,2),
 ('int-1d2025.html',lambda x:4*m.sin(5*x)*m.cos(3*x),0,m.pi/6,7/8),
 ('int-2e2025.html',lambda x:m.sin(x)**3*m.cos(x)**3,0,m.pi/2,1/12),
]
class CatalogueChecks(unittest.TestCase):
 def test_primitives_against_original_integrands(self):
  for route,f,p,points in PRIMITIVES:
   for x in points:
    with self.subTest(route=route,x=x):self.assertAlmostEqual(derivative(p,x),f(x),delta=1e-7*max(1,abs(f(x))))
 def test_areas_by_independent_numerical_quadrature(self):
  for route,f,a,b,answer in AREAS:
   with self.subTest(route=route):self.assertAlmostEqual(integral(f,a,b),answer,places=7)
  self.assertEqual(F(1,10)-F(1,16),F(3,80))
 def test_printed_and_physical_pumping_limits_are_distinct(self):
  integrand=lambda h:9800*(1.5-h)*(.6*h)**2
  self.assertAlmostEqual(integral(integrand,.5,1.5),1323,places=7)
  self.assertAlmostEqual(integral(integrand,0,1),882,places=7)
 def test_parametric_singularities_and_endpoint_limit(self):
  for t in [-2,-1,.5,2]:
   yp=2/(3*t);ypp=-2/(9*t**4)
   self.assertAlmostEqual(ypp/yp**4,-9/8)
  self.assertAlmostEqual(-m.sin(1e-5)/(6e-5),-1/6,places=9)
 def test_level_two_original_conditions(self):
  self.assertEqual(6*F(-1,2)**2-6*F(-1,2)+F(1,2),5)
  self.assertEqual(-F(2)**3/3+2*4-3*2+6,F(16,3))
  self.assertEqual(F(2,3)*3**3+3**2-24*3-1,-46)
  self.assertGreater(4*3+2,0) # minimum, not the other stationary point
  self.assertEqual(F(1,4)*40**2,200+5*40)
  self.assertEqual(F(1,2)*2**4-2*2**3+2**2+4*2+1,5)
  self.assertEqual(F(60)**2/50-F(14,5)*60+80,-16)
  self.assertEqual(F(100)**2/50-F(14,5)*100+80,0)
  self.assertLess(derivative(lambda t:t*t/50-2.8*t+80,40),0)
  self.assertGreater(derivative(lambda t:t*t/50-2.8*t+80,100),0)
  self.assertEqual(2*F(5,2)**2-7*F(5,2)-20,-25)
  self.assertAlmostEqual(derivative(lambda h:2*h*h,7),28,places=7)
  for k in [.1,1,7]:
   for x,sign in [(-k-1,-1),(-k/2,1),(1,-1),(4,1)]:self.assertGreater(sign*x*(x-3)*(x+k),0)
 def test_optimisation_candidates_against_nearby_values_and_endpoints(self):
  candidates=[('3c2016.html',lambda x:x*(x-6)**2,2,0,6,32),('3c2018.html',lambda x:x*(15-x*x),m.sqrt(5),0,m.sqrt(15),10*m.sqrt(5)),('2d2022.html',lambda x:6*x*m.exp(1-.5*x),2,0,15,12),('3c2025-l2.html',lambda h:2.16*h-2*h**3,.6,0,m.sqrt(1.08),.864)]
  for route,f,x,a,b,value in candidates:
   with self.subTest(route=route):
    self.assertAlmostEqual(derivative(f,x),0,places=7);self.assertAlmostEqual(f(x),value)
    self.assertGreater(f(x),f(x-.01));self.assertGreater(f(x),f(x+.01));self.assertGreater(f(x),f(a));self.assertGreater(f(x),f(b))
if __name__=='__main__':unittest.main(verbosity=2)
