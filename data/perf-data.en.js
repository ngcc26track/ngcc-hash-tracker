/* perf-data.js 的英文文字（数字不重复）；按算法名与条目顺序对应 */
window.PERF_DATA_EN = {
  notes: {
    'Litchi': 'Optimised implementation accepts whole-byte input only (KAT 513/4097)',
    'Laurus': 'Optimised implementation accepts whole-byte input only (KAT 513/4097)',
    'XRH-1': 'No usable optimised implementation; reference implementation used',
    'XRH-2': 'No usable optimised implementation; reference implementation used',
    'Neulaser': 'No KAT_2_12 vectors in the package; correctness not verified',
    'Pavelor': 'Reference implementation only: no optimised implementation without crypto instructions was submitted',
    'Wish': 'Reference implementation only: all four optimised implementations (x86/ARM) require hardware AES rounds'
  },
  issues: [
    { item: 'Garnet `opt-asm-512_{512,640,768,896}`', what: 'KAT 3624/4104', verdict: 'The assembly is missing one `inc rcx`, so a padding byte is lost; with it restored all four pass 4104/4104, performance difference < 0.5%' },
    { item: 'Laurus / Litchi `opt`', what: 'KAT 520/4104', verdict: 'The optimised core takes `inlen` in bytes while the same-named reference function takes bits, so every non-byte-aligned message fails; the ranking therefore uses `ref`' },
    { item: 'uHash `opt`', what: 'Does not compile on Linux as is', verdict: 'Unconditional `#include <windows.h>`, `#pragma intrinsic`, and C++ `nullptr` in the non-Windows branch; passes all 4104 vectors after 3 edits and 3 shims' },
    { item: 'WChain, all variants', what: 'Link failure', verdict: '`wchain_c.c` line 1058 has an unguarded `main()`; with it removed everything passes, `ref` rechecked 4104/4104' },
    { item: 'XRH-1 / XRH-2 `opt-prebuilt-asm`', what: 'Cannot be loaded', verdict: 'The pre-generated `.s` in the package has no build instructions and exports no usable symbols after linking' },
    { item: 'Neulaser', what: 'No KAT vectors', verdict: 'The package contains no `KAT_2_12`, so correctness cannot be checked against any reference' },
    { item: 'Eijen AVX-512', what: 'Not present', verdict: 'The document reports AVX-512 figures, but `_mm512` occurs 0 times in the package' },
    { item: 'ZC-1536', what: 'Self-reported 2.946 cpb not reproducible', verdict: 'Plain C 6.72 / AVX2 `.c` in the build 9.25 / AVX2 `.S` outside the build 6.09, none reproduces it; the `.c` vectorises only χ, θ/ρ stay scalar' },
    { item: 'Garnet, self-reported 2.83 cpb', what: 'Best measured 14.73', verdict: 'The reference C uses T-tables throughout with no `aesenc`; only the hand-written assembly of the 512 family uses AES instructions' },
    { item: 'Pavelor / Wish', what: 'No optimised implementation without crypto instructions', verdict: 'See §2' }
  ],
  meta: {
    zen4: 'AMD Ryzen 7 7800X3D (Zen4), gcc 13.3 -march=znver4, 64 KiB single message, 512-bit digest, rdtsc median; 2026-09-22',
    xeon: 'Cloud Xeon (TSC 2.80 GHz, AVX2/AVX-512/AES-NI), gcc 13 -O3 -march=native, 64 KiB, median of the best KAT-passing implementation; absolute values indicative only'
  }
};
