(function () {
  const raw = String.raw;
  const paperHref = "level-3-differentiation-2019.html";
  const questionOrder = [
    "1a", "1b", "1c", "1d", "1e",
    "2a", "2b", "2c", "2d", "2e",
    "3a", "3b", "3c", "3d", "3e"
  ];
  const questionImageDimensions = {
    "1a": [2438, 750], "1b": [2938, 563], "1c": [2938, 657], "1d": [2938, 563], "1e": [2938, 1094],
    "2a": [2625, 813], "2b": [2938, 688], "2c": [2938, 813], "2d": [2938, 2375], "2e": [2938, 750],
    "3a": [2625, 938], "3b": [2938, 2375], "3c": [2938, 2125], "3d": [2938, 938], "3e": [2938, 2375]
  };
  const metadata = {
    topic: "Differentiation",
    year: 2019,
    standard: "NCEA Level 3 Calculus",
    difficulty: "mixed / Excellence-style"
  };
  const tags = [
    "Differentiation",
    "2019",
    "NCEA Level 3 Calculus",
    "mixed / Excellence-style"
  ];

  function questionLabel(id) {
    return "Question " + id.charAt(0) + "(" + id.charAt(1) + ")";
  }

  function pageHref(id) {
    return id + "2019.html";
  }

  function previousId(id) {
    const index = questionOrder.indexOf(id);
    return index > 0 ? questionOrder[index - 1] : null;
  }

  function nextId(id) {
    const index = questionOrder.indexOf(id);
    return index >= 0 && index < questionOrder.length - 1 ? questionOrder[index + 1] : null;
  }

  function buildFinalNav(id) {
    const previous = previousId(id);
    const next = nextId(id);

    return {
      secondary: previous
        ? { href: pageHref(previous), label: "← Back to " + questionLabel(previous) }
        : { href: paperHref, label: "← Back to paper" },
      primary: next
        ? { href: pageHref(next), label: "Next question →" }
        : { href: paperHref, label: "Back to paper" }
    };
  }

  function buildPartNavigation(id) {
    return questionOrder.map(function (partId) {
      return {
        href: pageHref(partId),
        label: partId.charAt(0) + "(" + partId.charAt(1) + ")",
        current: partId === id
      };
    });
  }

  function createConfig(id, focus, details) {
    const next = nextId(id);

    return Object.assign({
      browserTitle: "2019 Differentiation Paper - " + questionLabel(id),
      eyebrow: "Level 3 Differentiation Walkthrough",
      title: questionLabel(id),
      subtitle: "2019 Paper",
      backHref: paperHref,
      nextHref: next ? pageHref(next) : paperHref,
      nextLabel: next ? "Next question →" : "Back to paper",
      finalNav: buildFinalNav(id),
      partNavigation: buildPartNavigation(id),
      partNavigationTitle: "2019 paper questions",
      focus: focus,
      metadata: metadata,
      tags: tags
    }, details);
  }

  function guidedStep(title, previewHtml, workingHtml) {
    return {
      title: title,
      previewHtml: previewHtml,
      workingHtml: workingHtml
    };
  }

  const accessibleQuestions = {
    "1a": raw`<p class="step-text">Differentiate \(y=\sqrt{3x^2-1}\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "1b": raw`<p class="step-text">Find the rate of change of the function \(f(t)=5\ln(3t-1)\) when \(t=4\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1c": raw`<p class="step-text">Find the gradient of the tangent to the curve \(y=\dfrac{e^{2x}}{1+x^2}\) at the point where \(x=2\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1d": raw`<p class="step-text">For what value(s) of \(x\) is the function \(y=x^3e^x\) decreasing?</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "1e": raw`<p class="step-text">The volume of a sphere is increasing. At the instant when the sphere’s radius is \(0.5\text{ m}\), its surface area is increasing at a rate of \(0.4\text{ m}^2\text{ s}^{-1}\). Find the rate at which the volume of the sphere is increasing at this instant.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2a": raw`<p class="step-text">Differentiate \(y=(2x-5)^4\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "2b": raw`<p class="step-text">Find the gradient of the tangent to the curve \(y=\tan 2x\) at the point on the curve where \(x=\pi/6\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2c": raw`<p class="step-text">A curve is defined parametrically by \(x=\dfrac1{(5-t)^2}\) and \(y=5t-t^2\). Find the gradient of the tangent to the curve at the point when \(t=2\).</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2d": raw`<p class="step-text">The Wynyard Crossing bridge in Auckland can be raised and lowered to allow tall boats to sail through when open, and pedestrians to walk across when closed. The bridge consists of two arms, each of length \(22\) metres.</p><p class="step-text">When the bridge is rising, the angle of the bridge arm above the horizontal increases at \(0.01\text{ rad s}^{-1}\). Find the rate at which the height, BH, is increasing when H is \(15\) metres above the horizontal, FB.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Bridge diagram: F is the hinge; FB is horizontal, BH is vertical, FH is a 22 metre bridge arm. The angle at F is θ."><rect width="440" height="320" fill="white"/><path d="M45 265L380 265" fill="none" stroke="#244c76" stroke-width="2"/><path d="M45 265L380 55" fill="none" stroke="#244c76" stroke-width="2"/><path d="M380 55L380 265" fill="none" stroke="#244c76" stroke-width="2"/><text x="20" y="282" fill="#172d45" font-size="15">F</text><text x="381" y="283" fill="#172d45" font-size="15">B</text><text x="385" y="52" fill="#172d45" font-size="15">H</text><text x="165" y="135" fill="#172d45" font-size="15">22 m</text><text x="390" y="170" fill="#172d45" font-size="15">BH</text><text x="88" y="254" fill="#172d45" font-size="15">θ</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "2e": raw`<p class="step-text">If \(y=e^u\) and \(u=\sin 2x\), show that</p><div class="question-math">\[\frac{d^2y}{dx^2}=\frac{d^2y}{du^2}\left(\frac{du}{dx}\right)^2+\frac{dy}{du}\frac{d^2u}{dx^2}.\]</div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3a": raw`<p class="step-text">Differentiate \(y=\dfrac4{\sin x}\).</p><p class="step-text">You do not need to simplify your answer.</p>`,
    "3b": raw`<p class="step-text">The graph shows \(y=f(x)\).</p><p class="step-text">(i) Find all values of \(x\) for which: 1. \(f^\prime(x)=0\); 2. \(f(x)\) is not differentiable.</p><p class="step-text">(ii) What is \(\lim_{x\to1}f(x)\)? State clearly if the value does not exist.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Graph description: a straight ray descends through (−5,6) to (−2,0); a straight segment rises to an open circle at (1,3). A separate curve begins at a filled point (1,4), rises smoothly to (2,5), then falls to (4,1). From (4,1) a horizontal ray continues to the right. The joins at (−2,0) and (4,1) are corners."><rect width="440" height="320" fill="white"/><path d="M32.0 184.0L407.0 184.0" fill="none" stroke="#244c76" stroke-width="2"/><path d="M219.5 284.0L219.5 34.0" fill="none" stroke="#244c76" stroke-width="2"/><text x="408" y="176.0" fill="#172d45" font-size="15">x</text><text x="227.5" y="27" fill="#172d45" font-size="15">y</text><path d="M250.75 84.0 L251.22 83.26 L251.69 82.52 L252.16 81.8 L252.63 81.09 L253.09 80.39 L253.56 79.7 L254.03 79.03 L254.5 78.36 L254.97 77.71 L255.44 77.06 L255.91 76.43 L256.38 75.81 L256.84 75.2 L257.31 74.6 L257.78 74.02 L258.25 73.44 L258.72 72.88 L259.19 72.32 L259.66 71.78 L260.12 71.25 L260.59 70.73 L261.06 70.22 L261.53 69.73 L262.0 69.24 L262.47 68.77 L262.94 68.3 L263.41 67.85 L263.88 67.41 L264.34 66.98 L264.81 66.56 L265.28 66.16 L265.75 65.76 L266.22 65.38 L266.69 65.0 L267.16 64.64 L267.62 64.29 L268.09 63.95 L268.56 63.62 L269.03 63.31 L269.5 63.0 L269.97 62.71 L270.44 62.42 L270.91 62.15 L271.38 61.89 L271.84 61.64 L272.31 61.4 L272.78 61.18 L273.25 60.96 L273.72 60.76 L274.19 60.56 L274.66 60.38 L275.12 60.21 L275.59 60.05 L276.06 59.9 L276.53 59.77 L277.0 59.64 L277.47 59.53 L277.94 59.42 L278.41 59.33 L278.88 59.25 L279.34 59.18 L279.81 59.12 L280.28 59.08 L280.75 59.04 L281.22 59.02 L281.69 59.0 L282.16 59.0 L282.62 59.01 L283.09 59.03 L283.56 59.06 L284.03 59.11 L284.5 59.16 L284.97 59.23 L285.44 59.3 L285.91 59.39 L286.38 59.49 L286.84 59.6 L287.31 59.72 L287.78 59.86 L288.25 60.0 L288.72 60.16 L289.19 60.32 L289.66 60.5 L290.12 60.69 L290.59 60.89 L291.06 61.1 L291.53 61.33 L292.0 61.56 L292.47 61.81 L292.94 62.06 L293.41 62.33 L293.87 62.61 L294.34 62.9 L294.81 63.2 L295.28 63.52 L295.75 63.84 L296.22 64.18 L296.69 64.52 L297.16 64.88 L297.62 65.25 L298.09 65.63 L298.56 66.02 L299.03 66.43 L299.5 66.84 L299.97 67.27 L300.44 67.7 L300.91 68.15 L301.38 68.61 L301.84 69.08 L302.31 69.56 L302.78 70.06 L303.25 70.56 L303.72 71.08 L304.19 71.6 L304.66 72.14 L305.12 72.69 L305.59 73.25 L306.06 73.82 L306.53 74.41 L307.0 75.0 L307.47 75.61 L307.94 76.22 L308.41 76.85 L308.88 77.49 L309.34 78.14 L309.81 78.8 L310.28 79.48 L310.75 80.16 L311.22 80.86 L311.69 81.56 L312.16 82.28 L312.62 83.01 L313.09 83.75 L313.56 84.5 L314.03 85.27 L314.5 86.04 L314.97 86.83 L315.44 87.62 L315.91 88.43 L316.38 89.25 L316.84 90.08 L317.31 90.92 L317.78 91.78 L318.25 92.64 L318.72 93.52 L319.19 94.4 L319.66 95.3 L320.13 96.21 L320.59 97.13 L321.06 98.06 L321.53 99.01 L322.0 99.96 L322.47 100.93 L322.94 101.9 L323.41 102.89 L323.88 103.89 L324.34 104.9 L324.81 105.92 L325.28 106.96 L325.75 108.0 L326.22 109.06 L326.69 110.12 L327.16 111.2 L327.63 112.29 L328.09 113.39 L328.56 114.5 L329.03 115.63 L329.5 116.76 L329.97 117.91 L330.44 119.06 L330.91 120.23 L331.38 121.41 L331.84 122.6 L332.31 123.8 L332.78 125.02 L333.25 126.24 L333.72 127.48 L334.19 128.72 L334.66 129.98 L335.12 131.25 L335.59 132.53 L336.06 133.82 L336.53 135.13 L337.0 136.44 L337.47 137.77 L337.94 139.1 L338.41 140.45 L338.88 141.81 L339.34 143.18 L339.81 144.56 L340.28 145.96 L340.75 147.36 L341.22 148.78 L341.69 150.2 L342.16 151.64 L342.62 153.09 L343.09 154.55 L343.56 156.02 L344.03 157.51 L344.5 159.0" stroke="#2563aa" stroke-width="2.5" fill="none"/><text x="58.25" y="204.0" fill="#172d45" font-size="15">-5</text><text x="89.5" y="204.0" fill="#172d45" font-size="15">-4</text><text x="120.75" y="204.0" fill="#172d45" font-size="15">-3</text><text x="152.0" y="204.0" fill="#172d45" font-size="15">-2</text><text x="183.25" y="204.0" fill="#172d45" font-size="15">-1</text><text x="214.5" y="204.0" fill="#172d45" font-size="15">0</text><text x="245.75" y="204.0" fill="#172d45" font-size="15">1</text><text x="277.0" y="204.0" fill="#172d45" font-size="15">2</text><text x="308.25" y="204.0" fill="#172d45" font-size="15">3</text><text x="339.5" y="204.0" fill="#172d45" font-size="15">4</text><text x="370.75" y="204.0" fill="#172d45" font-size="15">5</text><text x="402.0" y="204.0" fill="#172d45" font-size="15">6</text><text x="196.5" y="164.0" fill="#172d45" font-size="15">1</text><text x="196.5" y="114.0" fill="#172d45" font-size="15">3</text><text x="196.5" y="89.0" fill="#172d45" font-size="15">4</text><text x="196.5" y="64.0" fill="#172d45" font-size="15">5</text><text x="196.5" y="39.0" fill="#172d45" font-size="15">6</text><path d="M63.25 34.0L157.0 184.0" fill="none" stroke="#244c76" stroke-width="2"/><path d="M157.0 184.0L250.75 109.0" fill="none" stroke="#244c76" stroke-width="2"/><path d="M344.5 159.0L407.0 159.0" fill="none" stroke="#244c76" stroke-width="2"/><circle cx="250.75" cy="109.0" r="5" fill="white" stroke="#244c76" stroke-width="2"/><circle cx="250.75" cy="84.0" r="5" fill="#244c76"/></svg></div><details><summary>Graph description</summary><p class="step-text">Graph description: a straight ray descends through (−5,6) to (−2,0); a straight segment rises to an open circle at (1,3). A separate curve begins at a filled point (1,4), rises smoothly to (2,5), then falls to (4,1). From (4,1) a horizontal ray continues to the right. The joins at (−2,0) and (4,1) are corners.</p></details>`,
    "3c": raw`<p class="step-text">A rectangle has one vertex at \((0,0)\) and the opposite vertex on the curve \(y=4-\sqrt x\), where \(0\lt x\lt16\). Its sides lie along the axes, as in the diagram. Find the maximum possible area of the rectangle.</p><p class="step-text">You do not need to prove that the area you have found is a maximum.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Rectangle in the first quadrant with horizontal and vertical sides, bottom-left corner at the origin and top-right corner on y = 4 − √x. Curve intercepts: (0,4) and (16,0)."><rect width="440" height="320" fill="white"/><path d="M32.0 284.0L407.0 284.0" fill="none" stroke="#244c76" stroke-width="2"/><path d="M32.0 284.0L32.0 34.0" fill="none" stroke="#244c76" stroke-width="2"/><text x="408" y="276.0" fill="#172d45" font-size="15">x</text><text x="40.0" y="27" fill="#172d45" font-size="15">y</text><path d="M32.0 84.0 L33.67 98.14 L35.33 104.0 L37.0 108.49 L38.67 112.28 L40.33 115.62 L42.0 118.64 L43.67 121.42 L45.33 124.0 L47.0 126.43 L48.67 128.72 L50.33 130.9 L52.0 132.99 L53.67 134.99 L55.33 136.92 L57.0 138.77 L58.67 140.57 L60.33 142.31 L62.0 144.0 L63.67 145.64 L65.33 147.25 L67.0 148.81 L68.67 150.33 L70.33 151.82 L72.0 153.28 L73.67 154.71 L75.33 156.11 L77.0 157.48 L78.67 158.83 L80.33 160.16 L82.0 161.46 L83.67 162.74 L85.33 164.0 L87.0 165.24 L88.67 166.46 L90.33 167.67 L92.0 168.85 L93.67 170.02 L95.33 171.18 L97.0 172.32 L98.67 173.44 L100.33 174.55 L102.0 175.65 L103.67 176.74 L105.33 177.81 L107.0 178.87 L108.67 179.92 L110.33 180.95 L112.0 181.98 L113.67 182.99 L115.33 184.0 L117.0 185.0 L118.67 185.98 L120.33 186.96 L122.0 187.92 L123.67 188.88 L125.33 189.83 L127.0 190.77 L128.67 191.7 L130.33 192.63 L132.0 193.54 L133.67 194.45 L135.33 195.36 L137.0 196.25 L138.67 197.14 L140.33 198.02 L142.0 198.89 L143.67 199.76 L145.33 200.62 L147.0 201.47 L148.67 202.32 L150.33 203.16 L152.0 204.0 L153.67 204.83 L155.33 205.66 L157.0 206.47 L158.67 207.29 L160.33 208.1 L162.0 208.9 L163.67 209.7 L165.33 210.49 L167.0 211.28 L168.67 212.06 L170.33 212.84 L172.0 213.61 L173.67 214.38 L175.33 215.15 L177.0 215.91 L178.67 216.66 L180.33 217.42 L182.0 218.16 L183.67 218.91 L185.33 219.65 L187.0 220.38 L188.67 221.11 L190.33 221.84 L192.0 222.56 L193.67 223.28 L195.33 224.0 L197.0 224.71 L198.67 225.42 L200.33 226.13 L202.0 226.83 L203.67 227.53 L205.33 228.22 L207.0 228.91 L208.67 229.6 L210.33 230.29 L212.0 230.97 L213.67 231.65 L215.33 232.32 L217.0 233.0 L218.67 233.67 L220.33 234.33 L222.0 235.0 L223.67 235.66 L225.33 236.32 L227.0 236.97 L228.67 237.62 L230.33 238.27 L232.0 238.92 L233.67 239.56 L235.33 240.2 L237.0 240.84 L238.67 241.48 L240.33 242.11 L242.0 242.75 L243.67 243.37 L245.33 244.0 L247.0 244.62 L248.67 245.25 L250.33 245.86 L252.0 246.48 L253.67 247.1 L255.33 247.71 L257.0 248.32 L258.67 248.92 L260.33 249.53 L262.0 250.13 L263.67 250.73 L265.33 251.33 L267.0 251.93 L268.67 252.52 L270.33 253.12 L272.0 253.71 L273.67 254.29 L275.33 254.88 L277.0 255.46 L278.67 256.05 L280.33 256.63 L282.0 257.21 L283.67 257.78 L285.33 258.36 L287.0 258.93 L288.67 259.5 L290.33 260.07 L292.0 260.64 L293.67 261.2 L295.33 261.76 L297.0 262.33 L298.67 262.89 L300.33 263.44 L302.0 264.0 L303.67 264.55 L305.33 265.11 L307.0 265.66 L308.67 266.21 L310.33 266.76 L312.0 267.3 L313.67 267.85 L315.33 268.39 L317.0 268.93 L318.67 269.47 L320.33 270.01 L322.0 270.55 L323.67 271.08 L325.33 271.62 L327.0 272.15 L328.67 272.68 L330.33 273.21 L332.0 273.74 L333.67 274.26 L335.33 274.79 L337.0 275.31 L338.67 275.83 L340.33 276.35 L342.0 276.87 L343.67 277.39 L345.33 277.91 L347.0 278.42 L348.67 278.94 L350.33 279.45 L352.0 279.96 L353.67 280.47 L355.33 280.98 L357.0 281.48 L358.67 281.99 L360.33 282.49 L362.0 283.0 L363.67 283.5 L365.33 284.0" stroke="#2563aa" stroke-width="2.5" fill="none"/><rect x="32.0" y="184.0" width="83.33" height="100.0" fill="#dbeafe" stroke="#244c76"/><text x="357.33" y="304.0" fill="#172d45" font-size="15">16</text><text x="12.0" y="84.0" fill="#172d45" font-size="15">4</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3d": raw`<p class="step-text">The velocity of an object is modelled by \(v=2e^t+8e^{-t}\), for \(t\ge0\), where \(v\) is in \(\text{m s}^{-1}\) and \(t\) is time in seconds since the start of the motion. Find the time when its acceleration is zero.</p><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`,
    "3e": raw`<p class="step-text">The graph shows \(y=2\sqrt{36-x^2}\) and its tangent at P. The tangent intersects the \(x\)-axis at \((8,0)\). Find the \(x\)-coordinate of P.</p><div class="graph-frame question-graph-frame"><svg class="graph-svg" viewBox="0 0 440 320" role="img" aria-label="Upper half ellipse y = 2√(36 − x²), with intercepts (−6,0), (6,0) and (0,12). A tangent at P in the first quadrant meets the x-axis at (8,0)."><rect width="440" height="320" fill="white"/><path d="M32.0 267.33L407.0 267.33" fill="none" stroke="#244c76" stroke-width="2"/><path d="M189.26 284.0L189.26 34.0" fill="none" stroke="#244c76" stroke-width="2"/><text x="408" y="259.33" fill="#172d45" font-size="15">x</text><text x="197.26" y="27" fill="#172d45" font-size="15">y</text><path d="M44.1 267.33 L45.55 239.12 L47.0 227.53 L48.45 218.71 L49.9 211.33 L51.35 204.88 L52.81 199.1 L54.26 193.82 L55.71 188.95 L57.16 184.41 L58.61 180.16 L60.06 176.14 L61.52 172.34 L62.97 168.72 L64.42 165.27 L65.87 161.98 L67.32 158.82 L68.77 155.78 L70.23 152.86 L71.68 150.05 L73.13 147.33 L74.58 144.71 L76.03 142.18 L77.48 139.72 L78.94 137.35 L80.39 135.05 L81.84 132.81 L83.29 130.64 L84.74 128.54 L86.19 126.49 L87.65 124.5 L89.1 122.57 L90.55 120.69 L92.0 118.86 L93.45 117.08 L94.9 115.35 L96.35 113.66 L97.81 112.01 L99.26 110.41 L100.71 108.85 L102.16 107.33 L103.61 105.85 L105.06 104.41 L106.52 103.0 L107.97 101.63 L109.42 100.3 L110.87 99.0 L112.32 97.73 L113.77 96.5 L115.23 95.3 L116.68 94.13 L118.13 92.99 L119.58 91.88 L121.03 90.8 L122.48 89.75 L123.94 88.73 L125.39 87.73 L126.84 86.77 L128.29 85.83 L129.74 84.92 L131.19 84.03 L132.65 83.17 L134.1 82.34 L135.55 81.53 L137.0 80.74 L138.45 79.98 L139.9 79.25 L141.35 78.54 L142.81 77.85 L144.26 77.19 L145.71 76.55 L147.16 75.93 L148.61 75.33 L150.06 74.76 L151.52 74.21 L152.97 73.68 L154.42 73.18 L155.87 72.7 L157.32 72.23 L158.77 71.79 L160.23 71.37 L161.68 70.98 L163.13 70.6 L164.58 70.24 L166.03 69.91 L167.48 69.6 L168.94 69.3 L170.39 69.03 L171.84 68.78 L173.29 68.55 L174.74 68.34 L176.19 68.14 L177.65 67.97 L179.1 67.82 L180.55 67.69 L182.0 67.58 L183.45 67.49 L184.9 67.42 L186.35 67.37 L187.81 67.34 L189.26 67.33 L190.71 67.34 L192.16 67.37 L193.61 67.42 L195.06 67.49 L196.52 67.58 L197.97 67.69 L199.42 67.82 L200.87 67.97 L202.32 68.14 L203.77 68.34 L205.23 68.55 L206.68 68.78 L208.13 69.03 L209.58 69.3 L211.03 69.6 L212.48 69.91 L213.94 70.24 L215.39 70.6 L216.84 70.98 L218.29 71.37 L219.74 71.79 L221.19 72.23 L222.65 72.7 L224.1 73.18 L225.55 73.68 L227.0 74.21 L228.45 74.76 L229.9 75.33 L231.35 75.93 L232.81 76.55 L234.26 77.19 L235.71 77.85 L237.16 78.54 L238.61 79.25 L240.06 79.98 L241.52 80.74 L242.97 81.53 L244.42 82.34 L245.87 83.17 L247.32 84.03 L248.77 84.92 L250.23 85.83 L251.68 86.77 L253.13 87.73 L254.58 88.73 L256.03 89.75 L257.48 90.8 L258.94 91.88 L260.39 92.99 L261.84 94.13 L263.29 95.3 L264.74 96.5 L266.19 97.73 L267.65 99.0 L269.1 100.3 L270.55 101.63 L272.0 103.0 L273.45 104.41 L274.9 105.85 L276.35 107.33 L277.81 108.85 L279.26 110.41 L280.71 112.01 L282.16 113.66 L283.61 115.35 L285.06 117.08 L286.52 118.86 L287.97 120.69 L289.42 122.57 L290.87 124.5 L292.32 126.49 L293.77 128.54 L295.23 130.64 L296.68 132.81 L298.13 135.05 L299.58 137.35 L301.03 139.72 L302.48 142.18 L303.94 144.71 L305.39 147.33 L306.84 150.05 L308.29 152.86 L309.74 155.78 L311.19 158.82 L312.65 161.98 L314.1 165.27 L315.55 168.72 L317.0 172.34 L318.45 176.14 L319.9 180.16 L321.35 184.41 L322.81 188.95 L324.26 193.82 L325.71 199.1 L327.16 204.88 L328.61 211.33 L330.06 218.71 L331.52 227.53 L332.97 239.12 L334.42 267.33" stroke="#2563aa" stroke-width="2.5" fill="none"/><path d="M264.26 82.13L390.06 278.67" fill="none" stroke="#244c76" stroke-width="2"/><text x="300.55" y="127.05000000000001" fill="#172d45" font-size="15">P</text><text x="374.81" y="287.33" fill="#172d45" font-size="15">8</text><text x="161.26" y="67.33" fill="#172d45" font-size="15">12</text></svg></div><p class="step-text">You must use calculus and show any derivatives that you need to find when solving this problem.</p>`
  };

  const scanDimensions = {"1e": [2938, 1094], "1b": [2938, 563], "3a": [2625, 938], "2d": [2938, 2375], "2c": [2938, 813], "1c": [2938, 657], "1d": [2938, 563], "2b": [2938, 688], "2e": [2938, 750], "1a": [2438, 750], "3e": [2938, 2375], "3b": [2938, 2375], "3c": [2938, 2125], "3d": [2938, 938], "2a": [2625, 813]};

  function questionImage(id) {
    return accessibleQuestions[id] + `<details class="original-scan"><summary>Original question scan</summary><img class="question-screenshot" width="${scanDimensions[id][0]}" height="${scanDimensions[id][1]}" loading="lazy" src="assets/differentiation-2019/${id}-question.png" alt="Original scan of the question transcribed above" /></details>`;
  }

  function finalAnswer(html) {
    return raw`
      <div class="answer-highlight walkthrough-answer-highlight">
        <p class="question-label">Final Answer</p>
        ${html}
      </div>
    `;
  }

  window.Differentiation2019Walkthroughs = {
    "1a": createConfig("1a", raw`Chain rule differentiation of a square root.`, {
      questionHtml: questionImage("1a"),
      guidedSteps: [
        guidedStep("Rewrite the root", raw`
          <p class="step-text">Write the square root as a power before differentiating.</p>
        `, raw`
          <div class="math-block">
            \[
            y=(3x^2-1)^{\frac{1}{2}}
            \]
          </div>
        `),
        guidedStep("Differentiate with the chain rule", raw`
          <p class="step-text">Differentiate the outside power, then multiply by the derivative of \(3x^2-1\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{1}{2}(3x^2-1)^{-\frac{1}{2}}\times 6x
            \]
          </div>
        `),
        guidedStep("State the derivative", raw`
          <p class="step-text">The simplified form is optional in the PDF.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{3x}{\sqrt{3x^2-1}}
            \quad \text{(optional)}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}
              =
              \frac{1}{2}(3x^2-1)^{-\frac{1}{2}}\times 6x}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1b": createConfig("1b", raw`Differentiate a logarithmic function and evaluate the rate at \(t=4\).`, {
      questionHtml: questionImage("1b"),
      guidedSteps: [
        guidedStep("Differentiate the logarithm", raw`
          <p class="step-text">Use \(\frac{d}{dt}\ln(u)=\frac{u'}{u}\).</p>
        `, raw`
          <div class="math-block">
            \[
            f'(t)=\frac{5}{3t-1}\times 3
            \]
            \[
            =\frac{15}{3t-1}
            \]
          </div>
        `),
        guidedStep("Evaluate at t = 4", raw`
          <p class="step-text">Substitute \(t=4\) into the derivative.</p>
        `, raw`
          <div class="math-block">
            \[
            f'(4)=\frac{15}{11}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{f'(4)=\frac{15}{11}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1c": createConfig("1c", raw`Use the quotient rule, then evaluate the tangent gradient at \(x=2\).`, {
      questionHtml: questionImage("1c"),
      guidedSteps: [
        guidedStep("Set up the quotient rule", raw`
          <p class="step-text">Differentiate the numerator \(e^{2x}\) and the denominator \(1+x^2\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=\frac{e^{2x}}{1+x^2}
            \]
            \[
            \frac{dy}{dx}
            =
            \frac{2e^{2x}(1+x^2)-2xe^{2x}}{(1+x^2)^2}
            \]
          </div>
        `),
        guidedStep("Factor the derivative", raw`
          <p class="step-text">Keep the common factor \(2e^{2x}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{2e^{2x}(1+x^2-x)}{(1+x^2)^2}
            \]
          </div>
        `),
        guidedStep("Substitute x = 2", raw`
          <p class="step-text">The tangent gradient is the derivative at the point.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=2}
            =
            \frac{2e^4(1+2^2-2)}{(1+2^2)^2}
            \approx
            13.1
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{13.1}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1d": createConfig("1d", raw`Use the product rule and solve where the derivative is negative.`, {
      questionHtml: questionImage("1d"),
      guidedSteps: [
        guidedStep("Differentiate the product", raw`
          <p class="step-text">Apply the product rule to \(x^3e^x\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=x^3e^x
            \]
            \[
            \frac{dy}{dx}=3x^2e^x+x^3e^x
            \]
          </div>
        `),
        guidedStep("Factor the derivative", raw`
          <p class="step-text">Factor out \(x^2e^x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=x^2e^x(3+x)
            \]
          </div>
        `),
        guidedStep("Make the derivative negative", raw`
          <p class="step-text">The PDF uses the sign of \(3+x\) because \(x^2e^x\) is not negative.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}\lt 0
            \]
            \[
            3+x\lt 0
            \]
            \[
            x\lt -3
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{x\lt -3}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "1e": createConfig("1e", raw`Related rates connecting surface area, radius, and volume of a sphere.`, {
      questionHtml: questionImage("1e"),
      guidedSteps: [
        guidedStep("Connect the rates", raw`
          <p class="step-text">Use the chain rule to connect volume to surface area through the radius.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}
            =
            \frac{dV}{dr}\times\frac{dr}{dS}\times\frac{dS}{dt}
            \]
          </div>
        `),
        guidedStep("Differentiate volume", raw`
          <p class="step-text">Write the sphere volume and differentiate it with respect to \(r\).</p>
        `, raw`
          <div class="math-block">
            \[
            V=\frac{4}{3}\pi r^3
            \]
            \[
            \frac{dV}{dr}=4\pi r^2
            \]
          </div>
        `),
        guidedStep("Differentiate surface area", raw`
          <p class="step-text">Write the surface area and differentiate it with respect to \(r\).</p>
        `, raw`
          <div class="math-block">
            \[
            S=4\pi r^2
            \]
            \[
            \frac{dS}{dr}=8\pi r
            \]
          </div>
        `),
        guidedStep("Substitute the rate of surface area", raw`
          <p class="step-text">Use \(\frac{dr}{dS}=\frac{1}{8\pi r}\) and \(\frac{dS}{dt}=0.4\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dV}{dt}
            =
            4\pi r^2\times\frac{1}{8\pi r}\times 0.4
            \]
            \[
            \left.\frac{dV}{dt}\right|_{r=0.5}
            =
            0.1\ \text{m}^3\ \text{s}^{-1}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{0.1\ \text{m}^3\ \text{s}^{-1}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2a": createConfig("2a", raw`Chain rule differentiation of a fourth power.`, {
      questionHtml: questionImage("2a"),
      guidedSteps: [
        guidedStep("Differentiate the outside and inside", raw`
          <p class="step-text">Differentiate the fourth power, then multiply by the derivative of \(2x-5\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=(2x-5)^4
            \]
            \[
            \frac{dy}{dx}=4(2x-5)^3\times 2
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=4(2x-5)^3\times 2}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2b": createConfig("2b", raw`Differentiate \(y=\tan(2x)\) and evaluate the tangent gradient.`, {
      questionHtml: questionImage("2b"),
      guidedSteps: [
        guidedStep("Differentiate the tangent function", raw`
          <p class="step-text">Use \(\frac{d}{dx}\tan(u)=u'\sec^2(u)\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}=2\sec^2(2x)
            \]
            \[
            =\frac{2}{\cos^2(2x)}
            \]
          </div>
        `),
        guidedStep("Evaluate at x = pi over 6", raw`
          <p class="step-text">Substitute the given \(x\)-value.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{x=\frac{\pi}{6}}=8
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{8}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2c": createConfig("2c", raw`Parametric differentiation and evaluating the gradient when \(t=2\).`, {
      questionHtml: questionImage("2c"),
      guidedSteps: [
        guidedStep("Rewrite and differentiate x", raw`
          <p class="step-text">Write \(x\) as a power of \(5-t\), then differentiate with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            x=(5-t)^{-2}
            \]
            \[
            \frac{dx}{dt}=\frac{2}{(5-t)^3}
            \]
          </div>
        `),
        guidedStep("Differentiate y", raw`
          <p class="step-text">Differentiate \(y=5t-t^2\) with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dt}=5-2t
            \]
          </div>
        `),
        guidedStep("Form dy/dx", raw`
          <p class="step-text">Divide \(\frac{dy}{dt}\) by \(\frac{dx}{dt}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{(5-2t)(5-t)^3}{2}
            \]
          </div>
        `),
        guidedStep("Evaluate at t = 2", raw`
          <p class="step-text">Substitute \(t=2\).</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dy}{dx}\right|_{t=2}=13.5
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{13.5}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2d": createConfig("2d", raw`Related rates for the height of a rising bridge arm.`, {
      questionHtml: questionImage("2d"),
      guidedSteps: [
        guidedStep("Relate height and angle", raw`
          <p class="step-text">Use the right triangle formed by the bridge arm and the height.</p>
        `, raw`
          <div class="math-block">
            \[
            \sin\theta=\frac{h}{22}
            \]
          </div>
        `),
        guidedStep("Differentiate with respect to time", raw`
          <p class="step-text">Differentiate both sides with respect to \(t\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{d\theta}{dt}\cos\theta
            =
            \frac{1}{22}\frac{dh}{dt}
            \]
            \[
            \frac{dh}{dt}
            =
            22\times 0.01\cos\theta
            \]
          </div>
        `),
        guidedStep("Find the angle", raw`
          <p class="step-text">Use the instant when the height is \(15\) metres.</p>
        `, raw`
          <div class="math-block">
            \[
            \theta=\arcsin\left(\frac{15}{22}\right)\approx0.750\ \text{rad}
            \]
          </div>
        `),
        guidedStep("Evaluate the height rate", raw`
          <p class="step-text">Substitute the angle into the rate equation.</p>
        `, raw`
          <div class="math-block">
            \[
            \left.\frac{dh}{dt}\right|_{\theta=0.750}
            =
            0.1609\ \text{m}\ \text{s}^{-1}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{0.1609\ \text{m}\ \text{s}^{-1}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "2e": createConfig("2e", raw`Show the second-derivative chain rule identity for \(y=e^u\), \(u=\sin 2x\).`, {
      questionHtml: questionImage("2e"),
      guidedSteps: [
        guidedStep("Differentiate directly with respect to x", raw`
          <p class="step-text">First find the first and second derivatives of \(y=e^{\sin 2x}\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=e^{\sin 2x}
            \]
            \[
            \frac{dy}{dx}
            =
            e^{\sin 2x}\times 2\cos 2x
            \]
            \[
            \frac{d^2y}{dx^2}
            =
            -4\sin(2x)e^{\sin 2x}
            +
            (2\cos 2x)^2e^{\sin 2x}
            \]
          </div>
        `),
        guidedStep("Find the pieces in the identity", raw`
          <p class="step-text">Now find each derivative that appears on the right-hand side.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{du}=e^u
            \]
            \[
            \frac{d^2y}{du^2}=e^u
            \]
            \[
            \frac{du}{dx}=2\cos 2x
            \]
            \[
            \frac{d^2u}{dx^2}=-4\sin(2x)
            \]
          </div>
        `),
        guidedStep("Substitute into the right-hand side", raw`
          <p class="step-text">Put those pieces into the expression we need to show.</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{d^2y}{du^2}\left(\frac{du}{dx}\right)^2
            +
            \left(\frac{dy}{du}\right)\left(\frac{d^2u}{dx^2}\right)
            \]
            \[
            =
            e^u(2\cos 2x)^2
            +
            e^u(-4\sin 2x)
            \]
            \[
            =
            e^{\sin 2x}(2\cos 2x)^2
            +
            e^{\sin 2x}(-4\sin 2x)
            \]
          </div>
        `),
        guidedStep("Match the direct second derivative", raw`
          <p class="step-text">The substituted right-hand side is the same expression as the direct \(\frac{d^2y}{dx^2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            =
            \frac{d^2y}{dx^2}
            \]
          </div>
          ${finalAnswer(raw`
            <p class="step-text">Therefore the required identity is shown.</p>
            <div class="math-block">
              \[
              \boxed{
              \frac{d^2y}{dx^2}
              =
              \frac{d^2y}{du^2}\left(\frac{du}{dx}\right)^2
              +
              \frac{dy}{du}\frac{d^2u}{dx^2}
              }
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3a": createConfig("3a", raw`Rewrite the reciprocal as cosecant and differentiate.`, {
      questionHtml: questionImage("3a"),
      guidedSteps: [
        guidedStep("Rewrite using cosecant", raw`
          <p class="step-text">The PDF rewrites \(\frac{4}{\sin x}\) as \(4\csc x\).</p>
        `, raw`
          <div class="math-block">
            \[
            y=4\csc x
            \]
          </div>
        `),
        guidedStep("Differentiate", raw`
          <p class="step-text">Use \(\frac{d}{dx}\csc x=-\csc x\cot x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            -4\csc x\cot x
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{dy}{dx}=-4\csc x\cot x}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3b": createConfig("3b", raw`Read stationary points, non-differentiability, and a two-sided limit from a graph.`, {
      questionHtml: questionImage("3b"),
      guidedSteps: [
        guidedStep("Find where f prime is zero", raw`
          <p class="step-text">Look for horizontal tangents and horizontal pieces of the graph.</p>
        `, raw`
          <div class="math-block">
            \[
            f'(x)=0:
            \quad
            x=2,\ x>4
            \]
          </div>
        `),
        guidedStep("Find where the graph is not differentiable", raw`
          <p class="step-text">Corners, jumps, and endpoints where the gradient changes suddenly are not differentiable.</p>
        `, raw`
          <div class="math-block">
            \[
            f(x)\ \text{is not differentiable:}
            \quad
            x=-2,\ x=1,\ x=4
            \]
          </div>
        `),
        guidedStep("Read the limit at x = 1", raw`
          <p class="step-text">Compare the value approached from the left with the value approached from the right.</p>
        `, raw`
          <div class="math-block">
            \[
            \lim_{x\to 1} f(x)
            \quad
            \text{does not exist}
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{f'(x)=0:\ x=2,\ x>4}
              \]
              \[
              \boxed{f(x)\text{ is not differentiable at }x=-2,\ x=1,\ x=4}
              \]
              \[
              \boxed{\lim_{x\to 1}f(x)\text{ does not exist}}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3c": createConfig("3c", raw`Optimise the area of a rectangle under \(y=4-\sqrt{x}\).`, {
      questionHtml: questionImage("3c"),
      guidedSteps: [
        guidedStep("Write the area function", raw`
          <p class="step-text">The rectangle has width \(x\) and height \(y\).</p>
        `, raw`
          <div class="math-block">
            \[
            A=xy
            \]
            \[
            =x(4-x^{\frac{1}{2}})
            \]
            \[
            =4x-x^{\frac{3}{2}}
            \]
          </div>
        `),
        guidedStep("Differentiate area", raw`
          <p class="step-text">Differentiate \(A\) with respect to \(x\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dA}{dx}
            =
            4-\frac{3}{2}x^{\frac{1}{2}}
            \]
          </div>
        `),
        guidedStep("Set the derivative to zero", raw`
          <p class="step-text">At the maximum from the PDF working, set \(\frac{dA}{dx}=0\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dA}{dx}=0
            \]
            \[
            \frac{4}{3/2}=x^{\frac{1}{2}}
            \]
            \[
            x=\frac{64}{9}
            \]
          </div>
        `),
        guidedStep("Find the maximum area", raw`
          <p class="step-text">Substitute \(x=\frac{64}{9}\) into the area function.</p>
        `, raw`
          <div class="math-block">
            \[
            A=\frac{256}{27}\ \text{units}^2
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{\frac{256}{27}\ \text{units}^2}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3d": createConfig("3d", raw`Differentiate velocity to find when acceleration is zero.`, {
      questionHtml: questionImage("3d"),
      guidedSteps: [
        guidedStep("Set acceleration to zero", raw`
          <p class="step-text">Acceleration is the derivative of velocity.</p>
        `, raw`
          <div class="math-block">
            \[
            a(t)=2e^t-8e^{-t}=0
            \]
          </div>
        `),
        guidedStep("Solve the exponential equation", raw`
          <p class="step-text">Rearrange until there is a single exponential.</p>
        `, raw`
          <div class="math-block">
            \[
            2e^t=8e^{-t}
            \]
            \[
            4=e^{2t}
            \]
            \[
            t=\ln(2)
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{t=\ln(2)}
              \]
            </div>
          `)}
        `)
      ]
    }),

    "3e": createConfig("3e", raw`Use the tangent gradient on \(y=2\sqrt{36-x^2}\) to find point \(P\).`, {
      questionHtml: questionImage("3e"),
      guidedSteps: [
        guidedStep("Differentiate the curve", raw`
          <p class="step-text">Use the chain rule on \(y=2(36-x^2)^{1/2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{dy}{dx}
            =
            \frac{2}{2}(36-x^2)^{-\frac{1}{2}}\times -2x
            \]
            \[
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Use the tangent slope", raw`
          <p class="step-text">The tangent passes through point \(P=(x,y)\) and \((8,0)\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{y-y_1}{x-x_1}=m
            \]
            \[
            \frac{y-0}{x-8}
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Substitute the curve value for y", raw`
          <p class="step-text">At point \(P\), \(y=2\sqrt{36-x^2}\).</p>
        `, raw`
          <div class="math-block">
            \[
            \frac{2\sqrt{36-x^2}}{x-8}
            =
            \frac{-2x}{\sqrt{36-x^2}}
            \]
          </div>
        `),
        guidedStep("Solve for x", raw`
          <p class="step-text">Cross multiply and simplify.</p>
        `, raw`
          <div class="math-block">
            \[
            2(36-x^2)=-2x(x-8)
            \]
            \[
            72-2x^2=-2x^2+16x
            \]
            \[
            72=16x
            \]
            \[
            x=\frac{72}{16}=4.5
            \]
          </div>
          ${finalAnswer(raw`
            <div class="math-block">
              \[
              \boxed{x=4.5}
              \]
            </div>
          `)}
        `)
      ]
    })
  };
}());
