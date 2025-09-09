export const formatComplexMatrix = (mat) => {
  let latex = "\\begin{bmatrix}\n";
  latex += mat.map(
    row => row.map(
      c => `${c.re.toFixed(3)}${c.im >= 0 ? '+' : ''}${c.im.toFixed(3)}i`
    ).join(" & ")
  ).join(" \\\\\n");
  latex += "\n\\end{bmatrix}";
  return latex;
};

export const formatMatrixHTML = (mat, threshold = 1e-6) => {
  return `<table class="w-full border-collapse border border-gray-300 dark:border-gray-600 font-mono text-sm">` +
    mat.map(row => 
      `<tr>` + row.map(c => {
        let val = (Math.hypot(c.re, c.im) < threshold) ? "0" : `${c.re.toFixed(2)}${c.im >= 0 ? '+' : ''}${c.im.toFixed(2)}i`;
        return `<td class="text-center w-20 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">${val}</td>`;
      }).join('') + `</tr>`
    ).join('') +
  `</table>`;
};

export const displayResults = (stateVec, rho, reducedList, measurementResults = []) => {
  const dim = stateVec.length;
  const nQ = Math.log2(dim);
  
  let html = '<div class="space-y-6">';
  
  // Measurement results
  if (measurementResults.length > 0) {
    html += '<div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">';
    html += '<h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Measurement Results</h4>';
    measurementResults.forEach(result => {
      html += `<div class="text-yellow-700 dark:text-yellow-300">${result}</div>`;
    });
    html += '</div>';
  }
  
  // Final state amplitudes
  html += '<div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">';
  html += '<h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-3">Final State Amplitudes (nonzero)</h4>';
  html += '<div class="space-y-1">';
  
  for (let i = 0; i < dim; i++) {
    const mag = Math.hypot(stateVec[i].re, stateVec[i].im);
    if (mag > 1e-9) {
      const amp = `${stateVec[i].re.toFixed(3)}${stateVec[i].im >= 0 ? '+' : ''}${Math.abs(stateVec[i].im).toFixed(3)}j`;
      const binaryState = i.toString(2).padStart(nQ, '0');
      html += `<div class="font-mono text-sm text-blue-700 dark:text-blue-300">|${binaryState}⟩: ${amp}</div>`;
    }
  }
  html += '</div></div>';

  // Full density matrix
  html += '<div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">';
  html += '<h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-3">Full Density Matrix ρ</h4>';
  html += '<div class="overflow-auto max-w-full max-h-96">';
  
  if (rho.length <= 4 && rho[0].length <= 4) {
    html += `<div class="text-sm">$$${formatComplexMatrix(rho)}$$</div>`;
  } else {
    html += formatMatrixHTML(rho);
  }
  html += '</div></div>';

  // Reduced density matrices
  for (let q = 0; q < reducedList.length; q++) {
    html += '<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">';
    html += `<h4 class="font-semibold text-green-800 dark:text-green-200 mb-3">Reduced ρ (qubit ${q})</h4>`;
    html += '<div class="overflow-auto max-w-full max-h-96">';
    
    const mat = reducedList[q];
    if (mat.length <= 3 && mat[0].length <= 3) {
      html += `<div class="text-sm">$$${formatComplexMatrix(mat)}$$</div>`;
    } else {
      html += formatMatrixHTML(mat);
    }
    html += '</div></div>';
  }

  html += '</div>';
  return html;
};