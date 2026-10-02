/* 由 specs/*.json 生成，请勿手改；改 JSON 后重跑 gen.cjs */
(function () {
  var S = window.diagramSpecs = window.diagramSpecs || {};
  S.afs = {
    construction: {"kind":"sponge","midFeedforward":true,"tag":"Aligned-TrEDM · 中点前馈","permG":"AFS-p-S6\ng = 前 6 轮","permH":"AFS-p-S6\nh = 后 6 轮","rateBits":"r = 1024 bit","capBits":"c = 576 bit（= 对齐窗口 S）","capName":"对齐窗口 S","outFrom":"capacity","outLabel":"摘要 512 bit","outSub":"left_512(proj_S(X))，S 的另 64 位不可见","midLabel":"X[S] ⊕= T","spanLabel":"一个消息块 = 12 轮（6 + 6）","ffLabel":"橙色虚线 = 消息异或之后备份的窗口值 T = proj_S(X)；它在 g 跑完、h 开始之前异或回 S，前馈落在置换中点而不是末尾。","note":"五步吸收核：X ⊕= B → T ← proj_S(X) → X ← g(X) → X[S] ⊕= T → X ← h(X)。M₁ 与 M₂ 之间整整隔 12 轮，中点那一次前馈使吸收核不可逆。"},
    kind: "lattice",
    rows: 5,
    cols: 5,
    xLabel: "",
    yLabel: "",
    title: "AFS-p-S6 · 25 条 64 位道",
    subtitle: "一格 = 一条 64 位道，道号 l = 5y + x；25 格合计 1600 位。道内部还有结构：两个 32 位半字走一条 8 步 ARX 链",
    xTicks: ["x = 0","1","2","3","4"],
    yTicks: ["y = 0","1","2","3","4"],
    unitName: "道",
    ops: [
      { kind: "laneFunc", sample: [0,0], sym: "F", cap: "AFS-64 · 64 位 ARX 大 S 盒", formula: "A8 = 11000011\nK8 = [17,24,1,1,16,31,24,0]", innerTitle: "八步顺序更新；⋙ 为 32 位循环右移，x/y 使用刚更新的值", stages: ["0 · x⊞(y⋙17) ⊕κ","1 · y⊞(x⋙24) ⊕κ","2 · x⊕(y⋙1)","3 · y⊕(x⋙1)","4 · x⊕(y⋙16)","5 · y⊕(x⋙31)","6 · x⊞(y⋙24) ⊕κ","7 · y⊞x ⊕κ"], note: "每条 lane 拆 x=高32位、y=低32位；依编号更新，步骤 0/1/6/7 各 XOR 同一个 κ。8 步有 4 模加、8 XOR、7 个非零右旋；末步旋转量为 0。RC 是盒内部参数，不是盒前独立 XOR 层。", inCap: "图中高亮的是示例格，其余同样处理" },
      { kind: "columnMix", axis: "all", index: 0, sym: "L", cap: "L_P · 五列符号联合混合", formula: "L_P = μ ∘ π_AFS ∘ ρ_AFS ∘ M_col", detailTitle: "L_P 的四步：M_col → ρ_AFS → π_AFS → μ，其中两步是纯布线", detail: "每一列五条 lane 构成一个 bitsliced GF(32) 符号 U_x；全部五个 U_x 组成向量，V=C·U 后拆回 25 条 lane，64 个 z 切片并行。之后依次执行 ρ_AFS、π_AFS、μ。并非五个互相独立的单列 MDS。", note: "C 的 251 个方阵子式全部非奇异，符号级分支数 6；文档明确说明 GF(32) 符号是五条道的同一比特切片，符号级分支数不等于道级或比特级的活跃 S 盒下界，后者由文档的求解器结果给出（三轮窗口 N₃ ≥ 12）。", depNote: "五符号联合；符号分支数 6 不等于 lane 级界", inCap: "5 列各一个 GF(32) 符号，全部共同进入 C", groupBy: "groups", groups: [[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24]] },
      { kind: "directions", current: 0, cap: "S6 · 六方向轮转", formula: "L(A, ir) = τ_dir⁻¹ ∘ L_P ∘ τ_dir，dir = DIR[ir mod 6]", detailTitle: "仿射平面 AG(2,5) 的 6 族平行线，按 ir mod 6 轮换", note: "这是 L_P 的逐轮方向调度说明，与前一页线性层为同一操作，不额外执行一遍。DIR=[∞,0,1,2,3,4]；每一方向五条平行线各对应一个符号，五符号联合 MDS。", directions: [
        { label: "方向 ∞ · 竖线族", group: function (c, r) { return c; } },
        { label: "斜率 0 · 横线族", group: function (c, r) { return r; } },
        { label: "斜率 1", group: function (c, r) { return (r + 4 * c) % 5; } },
        { label: "斜率 2", group: function (c, r) { return (r + 3 * c) % 5; } },
        { label: "斜率 3", group: function (c, r) { return (r + 2 * c) % 5; } },
        { label: "斜率 4", group: function (c, r) { return (r + c) % 5; } }
      ] }
    ]
  };
  S.axis = {
    construction: {"kind":"stream","tag":"NLFSR 流式驱动 · 不是块吸收海绵","phases":[{"title":"初始化","sub1":"8 × 192 位寄存器载入 IV 与常数","sub2":"按实例载入初值与域参数"},{"title":"吸收 · 逐拍注入","sub1":"每拍注入 2 bit 消息","sub2":"消息进反馈函数，不占状态位置","feed":"消息比特流"},{"title":"终结化空转","sub1":"N_FinBeat = 1024 拍","sub2":"不再注入消息，只注入常数流 C"},{"title":"挤出","sub1":"N_DigGen = 256 拍","sub2":"每拍 GenDigest 取 2 bit"}],"stateLabel":"内部状态 1536 bit = 8 条 192 位非线性移位寄存器，环上编号 S⁰…S⁷","outLabel":"摘要 512 bit","outSub":"256 拍 × 2 bit 拼成","note":"AXIS 不是海绵、不是 MD、也不是 HAIFA：消息按拍注入反馈函数，没有 rate/capacity 的划分。统一实测中 32 字节消息约 23216 周期，主要来自与消息长度无关的 1024 拍空转终结化与 256 拍挤出。"},
    kind: "lattice",
    rows: 1,
    cols: 8,
    xLabel: "环上位置",
    yLabel: "",
    title: "8 条环形耦合的 NLFSR · 几何",
    subtitle: "一格 = 一条 192 位 NLFSR 寄存器 S^j = 6 个 32 位字；8 格排成一条环（下标模 8），τ 的抽头 j+1 / j+3 / j+5 与 b 的 j−1 在图上就是水平距离",
    yTicks: ["环"],
    cellNames: ["S⁰","S¹","S²","S³","S⁴","S⁵","S⁶","S⁷"],
    unitName: "寄存器",
    ops: [
      { kind: "wire", sym: "τ", cap: "τ · 跨寄存器抽头", formula: "每条邻居交出 2 bit，共 6 bit\nSBox = x₅x₄ ⊕ x₃x₂ ⊕ x₁x₀ → 1 bit", perCell: {"S⁵":["交出 2 bit"],"S³":["交出 2 bit"],"S¹":["交出 2 bit"],"S⁰":["← τ（1 bit）"]}, leftCap: "以 j = 0 为例：格内是该寄存器本步交出的比特数", rightCap: "8 条寄存器各算一次 τ，下标整体平移", detailTitle: "τ 究竟动了多少比特", summary: ["只有 S^{j+5}、S^{j+3}、S^{j+1} 参与，而且每条只交出 2 bit：跨寄存器耦合的带宽是 6 bit 进、1 bit 出，不是整条 192 位寄存器。","SBox 不是置换 S 盒，是一个 6→1 的二次布尔函数（三个独立乘积项之和），代数次数 2，整层只要 3 个 AND + 2 个 XOR，没有 DDT 可查。","一拍内按 j=0→7 就地更新，所有邻居下标都取 mod 8；绕回较小下标时读到本拍已更新的值，未更新下标则读旧值。"] },
      { kind: "wire", sym: "b", cap: "b · 外部注入与串行链", formula: "b = m ⊕ SBox(S^j 6 bit) ⊕ τ ⊕ S^{j−1}[11]", perCell: {"S⁰":["⊕ mµ"],"S¹":["⊕ mν"],"S²":["⊕ mµ"],"S³":["⊕ mν"],"S⁴":["⊕ mµ"],"S⁵":["⊕ mν"],"S⁶":["⊕ mµ"],"S⁷":["⊕ mν"]}, chain: [{"from":"S⁰","to":"S¹","label":"ExL[6]"},{"from":"S¹","to":"S²","label":"ExL[6]"},{"from":"S²","to":"S³","label":"ExL[6]"}], chainTitle: "一拍内 j = 0→7 就地更新造成的串行链", chainNote: "…直到 S⁷", leftCap: "8 条寄存器每拍各吃一位外部量", rightCap: "吸收阶段是消息比特，终结化与挤出阶段是常数流 C", detailTitle: "这一步注入的是消息，不是轮常数", summary: ["AXIS 没有轮常数这个概念：吸收阶段 b 里的 m 是消息比特（512 每拍 2 bit、768 偶 1 奇 2、1024 每拍 1 bit），只有终结化与挤出阶段才换成周期 192 拍的常数流 C。","前驱 j−1 也取 mod 8：j=0 读旧 S⁷，其后读已更新的前驱。因此寄存器之间存在串行依赖。","外部注入按寄存器奇偶分别取 mµ、mν，同一消息比特进入多条寄存器。"] },
      { kind: "laneFunc", sample: [0,0], sym: "t", cap: "t0 / t1 · 寄存器内抽头合成", formula: "t0 = Sʲ[0] ⊕ Sʲ[12] ⊕ Sʲ[32] ⊕ b\nt1 = Sʲ[96] ⊕ Sʲ[107] ⊕ Sʲ[125] ⊕ b", innerTitle: "S^j 内部：ExL 的 7 个固定抽头位置", stages: ["ExL[0..6]=0,12,32,96,107,125,11","低三抽头 ⊕ b → t0","高三抽头 ⊕ b → t1","前驱 bit11 已进入 b"], note: "跨寄存器的耦合已经在 τ 与 b 两步做完，t0 / t1 的合成只用本寄存器的 6 个固定比特位置。抽头间隔按 32 bit 粒度选取，但 107 与 96 只差 11，所以 32 拍并行需要对拍间依赖做符号展开。" },
      { kind: "laneRotate", amounts: function (c, r) { return [1][r % 1]; }, sample: [0,0], cap: "SHIFT · 整条 192 位循环右移", formula: "S^j[191..0] ← S^j[0, 191, …, 1]\nUpL = (188, 178, 162, 90, 75, 66)", note: "先异或写回 t1 至 bit66/75/90，t0 至 bit162/178/188，然后整条 192 位寄存器循环右移 1 位。数组从右向左编号：UpL[0]=66，UpL[5]=188。所有下标模 8，依次更新八个寄存器才构成一拍。", unitBits: 192, dir: "right", crossNote: "写回发生在旋转之前；目标位置随该次循环右移一起移动。" }
    ]
  };
  S.champ = {
    construction: {"kind":"chain","tag":"Cayley 群同态 · 无填充","box":"右乘生成元","boxSub1":"bit = 0 → ×A，bit = 1 → ×B","boxSub2":"8 次 F_p 模乘 + 4 次模加","chainBits":"2×2 矩阵 / F_p","finalBox":"终结化：逐元素模逆","finalSub1":"inv(h₁₁) ‖ inv(h₂₁) ‖ inv(h₁₂) ‖ inv(h₂₂)","finalSub2":"双射，不做任何压缩","note":"固定初态为单位矩阵；逐 bit 右乘选出的生成元，无填充。摘要通过逐元素 inv₀ 公开可逆，拼接同态作用在解码后的矩阵状态。公开论坛指出，行列式论证仅约束不同长度的碰撞，不覆盖等长消息。文档 Julia 与 C 的元素字节序不同，本图按 C 的列主序、小端编码标注。","msgLabels":["消息比特 = 0","消息比特 = 1"],"ivLabel":"H₀ = I（单位矩阵）"}
  };
  S.chash = {
    construction: {"kind":"chain","tag":"Rocket-JH · 每块一个不同的置换域","box":"C-Engine","boxSub1":"1536 位 · 28 轮","boxSub2":"计数器占输入的 64 位","chainBits":"h = h₁‖h₂ = 1472 bit","skipEdge":false,"finalBox":"FIL 终结化","finalSub1":"独立 LaneID 0x02 域","finalSub2":"取 h = 736 bit，再截断到 512","note":"计数器 = [LaneID]₈ ‖ [块号]₅₆，高字节放算法身份、低 56 位进位不越界；C-Hash-1024 改用带前馈的 CTR-Func 使终结化单向。","msgBypass":true,"dmLabel":"JH 宽管：同一块 m_i 在置换前异或进左半（x_{i,1} = h_{i−1,1} ⊕ m_i），置换后再异或进右半（h_{i,2} = y_2 ⊕ m_i）"},
    kind: "lattice",
    rows: 64,
    cols: 6,
    xLabel: "矩阵行",
    yLabel: "列",
    title: "C-Engine · 6 × 64 的 nibble 矩阵",
    subtitle: "一格 = 一个 4 位 nibble；图上一行 = 矩阵的一列（6 个 nibble = 24 位），共 64 列；384 个 nibble = 1536 位（含 64 位域计数器）",
    xTicks: ["行0","行1","行2","行3","行4","行5"],
    unitName: "nibble",
    ops: [
      { kind: "sbox", axis: "row", index: 0, width: 6, cap: "S-Layer · 24 位超级 S 盒（一列 6 个 nibble）", formula: "SPS = S⁶ → M₆ → ⊕0xC908B2 → S⁶", parallelNote: "× 64 列 = 每轮 64 个 24 位超级 S 盒", inCap: "一列 6 个 nibble 一起进一个超级 S 盒", depNote: "输出写回同一列的 6 个 nibble，列与列之间本层不交换", sliceTitle: "一列 6 个 nibble = 24 位，依次过 6×S₄ → M₆ₓ₆ → ⊕0xC908B2 → 6×S₄", note: "S4 = [1,4,0,c,3,2,5,b,a,8,6,f,7,9,d,e]，文档给出：双射、无不动点、DDT 最大项 4、LAT 最大项 4、代数次数 3、BCT 最大项 6。M6×6 的定义见文档 Eq.(4)。常数 0xC908B2 取自 √2，与轮常数的 π 来源相互独立。", stages: ["6 × S₄","M₆×₆","⊕ C908B2","6 × S₄"] },
      { kind: "columnMix", axis: "column", index: 0, sym: "M", cap: "M-Layer · M64：一行 64 个 nibble 全混", formula: "行 ← M64(行)，6 行各自独立并行", inCap: "矩阵第 0 行的 64 个 nibble 作为一组输入", depNote: "六行各自过同一个 M64，行与行在本层完全不交换", detailTitle: "六行各自独立过同一个 M64；行间不交换", detail: "M-Layer 作用在 6 × 64 nibble 矩阵的每一行上：行内 64 个 nibble 全混，行与行之间在本层完全不交换（图上只有一列亮着，就是这个意思）。M64 由 4 轮扩展 Lai–Massey 生成：S ← P1(L ⊕ R)，L′ ← L ⊕ S，R′ ← P2(R ⊕ S)，L/R 各 32 个 nibble，P1 偏移 (15, 7, 23, 16)，P2 = 循环右移 1。", note: "文档给出 M64 可逆、分支数 18。M64 由 4 轮扩展 Lai–Massey 结构生成，P1、P2 只移动 nibble 位置，硬件上为固定布线；六行共用同一个矩阵。" },
      { kind: "const", axis: "cells", cells: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]], cap: "K-Layer · 轮常数只打 8 个 nibble", formula: "X[0][0..7] ← X[0][0..7] ⊕ RCᵢ", selCap: "384 个 nibble 里只有第 0 行的前 8 列参与", unitBits: 4, injTitle: "轮常数落在哪些比特上（一个 nibble = 4 位，整格被改写）", note: "RC₀ 的大端 nibble 序是 2,4,3,F,6,A,8,8，逐格异或的非零位不同。其他轮使用各自 RC；这些 nibble 不代表四个位都同时翻转，常数会通过后续轮传播。" }
    ]
  };
  S.chime = {
    construction: {"kind":"sponge","feedforward":false,"tag":"标准海绵 · pad10*1","perm":"M39F\n1536 位 · 15 轮","rateBits":"r = 512 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"Truncate_512(S)，恰好等于整个 rate","note":"主图为 CHIME-512：初态全零，pad10*1，消息只异或进 rate。CHIME-1024 使用容量前馈（r = 448、c = 1088）；末块吸收前翻转状态末位，保存旧容量并在置换后异或回，摘要取状态末 1024 位。"},
    kind: "lattice",
    rows: 2,
    cols: 3,
    xLabel: "",
    yLabel: "",
    title: "M39F · 3 组 × 2 个 256 位数组",
    subtitle: "一格 = 一个 256 位数组 = 一个 YMM 寄存器 = 4 条 64 位 lane；6 格合计 1536 位",
    bands: [{"from":[0,0],"to":[0,1],"label":"rate　A0‖A1","color":"#3f85d6"},{"from":[1,0],"to":[2,1],"label":"capacity　B0‖B1‖C0‖C1","color":"#94a3b8"}],
    xTicks: ["A 组","B 组","C 组"],
    yTicks: ["下标 0","下标 1"],
    cellNames: ["A0","B0","C0","A1","B1","C1"],
    unitName: "数组",
    ops: [
      { kind: "wire", sym: "λ", cap: "线性层", formula: "11 × XOR256　3 × ROL64　2 × SHIFT64　6 × 字重排", perCell: {}, chain: [], leftCap: "格内：该数组被其他赋值读取的编号", rightCap: "格内：写入该数组的赋值编号，对应下方列表", detailTitle: "λ · 13 条赋值，11 次异或", summary: ["ROL64 表示每条 64 位 lane 的循环左移；<< / >> 表示补零的逻辑移位。","Πperm32 / Πperm64 / Πswap64 / Πswap128 均为数组内部字重排，不是跨数组搬移。"], chainTitle: "赋值序列中最长的一条串行依赖链", chainNote: "B1 还要再异或 ROL31(A1)；后续赋值读取此前已更新的值", assignments: ["B1 ← B1 ⊕ Πperm32(C1)","B0 ← B0 ⊕ A1","C0 ← C0 ⊕ ROL64(A0,29)","B1 ← B1 ⊕ ROL64(A1,31)","C1 ← C1 ⊕ ROL64(A0,13)","C0 ← C0 ⊕ B1","A0 ← Πperm64(A0)","C1 ← C1 ⊕ Πperm32(B1)","A1 ← Πswap128(A1)","A0 ← A0 ⊕ Πswap64(C0)","A1 ← A1 ⊕ Πperm32(B0)","B1 ← B1 ⊕ (A0 << 7)","C1 ← C1 ⊕ (A1 >> 5)"], outMarks: {"B1":["写 01·04·12"],"B0":["写 02"],"C0":["写 03·06"],"C1":["写 05·08·13"],"A0":["写 07·10"],"A1":["写 09·11"]}, inMarks: {"C1":["读 01"],"A1":["读 02·04·13"],"A0":["读 03·05·12"],"B1":["读 06·08"],"C0":["读 10"],"B0":["读 11"]} },
      { kind: "const", axis: "cells", cells: [[0,0]], cap: "AC · 四字不同的修订常数", formula: "A0[k] ⊕= Xᵢ,ₖ\nXᵢ,ₖ = F(4i+k)", selCap: "6 个数组里只有 A0 参与", note: "2026 年 9 月常数勘误；注入位置不变，生成器输入改为 4i+k。", laneSplit: {"n":4,"labels":["Xᵢ,₀","Xᵢ,₁","Xᵢ,₂","Xᵢ,₃"],"note":"i=0：409AC7567F4A7C15 / E2C34D9DFE94F82B / 040BD3C37DDF743D / A670580AFD29F057。四字不同；全部 20×4 个字见勘误 Table 1。"}, splitTitle: "A0 内部的 4 条 64 位 lane" },
      { kind: "pairing", cap: "χ · 3 位非线性层，偶奇轮换配对", groups: [{"label":"偶数轮：同下标配对","active":true,"sets":[["A0","B0","C0"],["A1","B1","C1"]]},{"label":"奇数轮：跨下标交叉配对","active":false,"sets":[["A0","B1","C1"],["A1","B0","C0"]]}], detailTitle: "同一个 3 位 S 盒，两种配对方式", summary: ["S(x) = x ⊕ (¬x₊₁ ∧ x₊₂)，查找表 [0,5,3,2,6,1,4,7]；差分均匀度 2，最大线性相关 1/2，代数次数 2，与 Keccak 的 χ₃ 相同。","每组 3 个数组的同一位下标凑成 3 个输入比特，一组就是 256 个并行 S 盒，两组合计 512 个 / 轮。","每组 3 个 ANDNOT + 3 个 XOR，两组合计 6 + 6 个 256 位操作；各组的 3 个输出必须读取同一组旧输入。"] },
      { kind: "cycle", cap: "τ · 6 个数组整体轮转", order: ["A0","A1","B0","B1","C0","C1"], direction: "forward", schedule: [{"label":"轮 0–2 σ","dir":"fwd"},{"label":"轮 3–5 σ⁻¹","dir":"rev"},{"label":"轮 6–8 σ","dir":"fwd"},{"label":"轮 9–11 σ⁻¹","dir":"rev"},{"label":"轮 12–14 σ","dir":"fwd"}], current: 0, netNote: "每 6 轮：正向 3 次，逆向 3 次。", rightNotes: ["仅合成 τ 的搬移：15 轮为 σ³，20 轮为 σ²。","完整轮函数还包含 λ、AC、χ，6 轮整体并非恒等。","箭头表示旧数组 → 新数组位置；节点表示整个 256 位数组。"], detailTitle: "τ 的调度", summary: ["正向：A0 → A1 → B0 → B1 → C0 → C1 → A0；逆向沿相反方向搬移。","轮号从 0 计数。该调度每 6 轮重复，不表示状态值或完整置换每 6 轮重复。"] }
    ]
  };
  S.cuishen = {
    construction: {"kind":"chain","tag":"双分块长度 Merkle–Damgård · Naito SAC 2011","box":"压缩函数","boxSub1":"E(Kᵢ, t) ⊕ t","boxSub2":"E(Kᵢ, t⊕1) ⊕ (t⊕1)","chainBits":"2n bit = t ‖ b","finalBox":"终结函数","finalSub1":"E(Kf, [2]ₙ) ‖ E(Kf, [3]ₙ)","finalSub2":"顺带吸收残余块","note":"没有宽置换，也没有 rate / capacity：消息块 mᵢ、旧链值 bᵢ₋₁ 和位置计数器 Cntᵢ 一起组成 Octarx 的超长密钥（1408 / 1664 位），同一套密钥编排驱动两条加密路径，两条输出拼成 2n 位的新链值。填充是纯零填充，单射性依赖 Cnt 精确记录原始比特长度，Cnt 不能计入补零。终结函数不做前馈，输出不是链值，因此长度扩展攻击不适用；迭代阶段的明文常数 [1]ₙ 与终结阶段的 [2]ₙ、[3]ₙ 不相交，构成事实上的域分离。"},
    kind: "flow",
    height: 664,
    title: "Octarx-256 · 一轮广义 Feistel",
    subtitle: "四个 64-bit 字 A/B/C/D；⊞ 是模 2⁶⁴ 加，也是 Octarx 唯一的非线性来源",
    graph: {"zones":[{"x":34,"y":74,"w":286,"h":150,"label":"密钥编排（两条 DBL 路径共用）"},{"x":344,"y":74,"w":662,"h":92,"label":"本轮输入状态 Xᵢ"},{"x":344,"y":196,"w":320,"h":250,"label":"C′ 分支"},{"x":686,"y":196,"w":320,"h":250,"label":"D′ 分支"},{"x":344,"y":462,"w":662,"h":92,"label":"下一轮状态 Xᵢ₊₁"}],"nodes":{"KM":{"x":50,"y":104,"w":78,"h":40,"label":"KM","sub":"消息","role":"key"},"KB":{"x":140,"y":104,"w":78,"h":40,"label":"KB","sub":"链值","role":"key"},"KC":{"x":230,"y":104,"w":74,"h":40,"label":"KCnt","sub":"计数器","role":"key"},"Wk":{"x":96,"y":168,"w":162,"h":40,"label":"wᵃ wᵇ wᶜ wᵈ","sub":"四个轮密钥字","role":"key"},"A":{"x":366,"y":104,"w":132,"h":44,"label":"A","sub":"64 bit"},"B":{"x":522,"y":104,"w":132,"h":44,"label":"B","sub":"64 bit"},"C":{"x":700,"y":104,"w":132,"h":44,"label":"C","sub":"64 bit"},"D":{"x":856,"y":104,"w":132,"h":44,"label":"D","sub":"64 bit"},"T":{"x":452,"y":226,"w":148,"h":40,"label":"T = C ⊕ D","shape":"op"},"xA":{"x":366,"y":300,"w":128,"h":38,"label":"A ⊕ wᵃ ⊕ c","shape":"op"},"rA":{"x":366,"y":352,"w":128,"h":36,"label":"ROL₇","shape":"op"},"xT1":{"x":516,"y":300,"w":128,"h":38,"label":"T ⊕ wᵈ","shape":"op"},"rT1":{"x":516,"y":352,"w":128,"h":36,"label":"ROL₂₀","shape":"op"},"addC":{"x":440,"y":404,"w":128,"h":36,"label":"⊞ mod 2⁶⁴","shape":"op"},"xB":{"x":708,"y":300,"w":128,"h":38,"label":"B ⊕ wᵇ","shape":"op"},"rB":{"x":708,"y":352,"w":128,"h":36,"label":"ROL₃₁","shape":"op"},"xT2":{"x":858,"y":300,"w":128,"h":38,"label":"T ⊕ wᶜ","shape":"op"},"rT2":{"x":858,"y":352,"w":128,"h":36,"label":"ROL₅₆","shape":"op"},"addD":{"x":782,"y":404,"w":128,"h":36,"label":"⊞ mod 2⁶⁴","shape":"op"},"A2":{"x":366,"y":492,"w":132,"h":44,"label":"A′ = C","sub":"直接搬移"},"B2":{"x":522,"y":492,"w":132,"h":44,"label":"B′ = D","sub":"直接搬移"},"C2":{"x":700,"y":492,"w":132,"h":44,"label":"C′","sub":"新计算","role":"result"},"D2":{"x":856,"y":492,"w":132,"h":44,"label":"D′","sub":"新计算","role":"result"}},"edges":[{"id":"km","d":"M89 144 V156 H120 V168"},{"id":"kb","d":"M179 144 V 168"},{"id":"kc","d":"M267 144 V 160 H 220 V 168"},{"id":"w2c","d":"M177 208 V 319 H 366"},{"id":"w2d","d":"M258 188 H328 V280 H696 V319 H708"},{"id":"c2t","d":"M766 148 V 186 H 526 V 226"},{"id":"d2t","d":"M922 148 V 176 H 526 V 226"},{"id":"a2x","d":"M430 148 V 300"},{"id":"t2x1","d":"M580 266 V 300"},{"id":"x2r","d":"M430 338 V 352"},{"id":"x2r1","d":"M580 338 V 352"},{"id":"r2a","d":"M430 388 V 396 H 480 V 404"},{"id":"r12a","d":"M580 388 V 396 H 528 V 404"},{"id":"add2c","d":"M504 440 V 470 H 766 V 492"},{"id":"b2x","d":"M588 148 V168 H676 V278 H772 V300"},{"id":"t2x2","d":"M600 246 H 922 V 300"},{"id":"x2rb","d":"M772 338 V 352"},{"id":"x2r2","d":"M922 338 V 352"},{"id":"r2b","d":"M772 388 V 396 H 822 V 404"},{"id":"r22b","d":"M922 388 V 396 H 870 V 404"},{"id":"add2d","d":"M846 440 V 470 H 922 V 492"},{"id":"c2a","d":"M700 126 H 660 V 478 H 432 V 492"},{"id":"d2b","d":"M856 126 H 840 V 470 H 588 V 492"},{"id":"w2tc","d":"M258 188 H328 V280 H506 V319 H516"},{"id":"w2td","d":"M258 188 H328 V280 H850 V319 H858"}]},
    steps: [{"nodes":["KM","KB","KC","Wk"],"edges":["km","kb","kc"],"formula":"Wᵢ = KMᵢ ⊕ KBᵢ ⊕ KCntᵢ　　Wᵢ = (wᵃ, wᵇ, wᶜ, wᵈ)","note":"消息、链值、计数器三路各自演化后异或成四个轮密钥字；两条 DBL 加密路径共用这一套编排。"},{"nodes":["C","D","T"],"edges":["c2t","d2t"],"formula":"Tᵢ = Cᵢ ⊕ Dᵢ","note":"右半状态先压成一个公共字 T，随后同时进入两条分支，因此 C、D 会影响两个新输出。本步完全线性。"},{"nodes":["A","T","Wk","xA","rA","xT1","rT1","addC","C2"],"edges":["a2x","t2x1","x2r","x2r1","r2a","r12a","add2c","w2c","w2tc"],"formula":"Cᵢ₊₁ = ROL₇(Aᵢ ⊕ wᵃᵢ ⊕ cᵢ) ⊞ ROL₂₀(Tᵢ ⊕ wᵈᵢ)","note":"两侧旋转量刻意不同；轮常数只进入这一条分支。"},{"nodes":["B","T","Wk","xB","rB","xT2","rT2","addD","D2"],"edges":["b2x","t2x2","x2rb","x2r2","r2b","r22b","add2d","w2d","w2td"],"formula":"Dᵢ₊₁ = ROL₃₁(Bᵢ ⊕ wᵇᵢ) ⊞ ROL₅₆(Tᵢ ⊕ wᶜᵢ)","note":"与 C′ 分支结构相同、密钥字不同，两条分支可以并行计算。"},{"nodes":["C","D","A2","B2","C2","D2"],"edges":["c2a","d2b"],"formula":"Xᵢ₊₁ = (Cᵢ, Dᵢ, C′, D′)","note":"旧的右半不加修改地搬到左半，新算出的两个字成为新右半：每轮交换左右角色，T 不进入下一状态。"}]
  };
  S.dragon = {
    construction: {"kind":"sponge","feedforward":true,"tag":"Sponge-FP · 容量侧前馈","perm":"Dragon-p\n1600 位 · 16 轮","rateBits":"r = 1024 bit","capBits":"c = 576 bit","capName":"inner","outFrom":"capacity","outLabel":"截取 inner","outSub":"h ≤ c，零次额外置换","ffLabel":"置换前保存 inner，置换后异或回 inner","note":"X ← P(X) ⊕ (0^r ‖ right_c(X))：只有 capacity 部分做 Davies–Meyer 式前馈，rate 不前馈（文档说明前馈外部不增加安全性）。填充 pd10*，末块把 C = 0^{c−1}‖1 异或进 capacity，用于防止从 inner 输出引起的长度扩展问题。摘要从 inner 读，h ≤ c，挤出阶段不调用置换；前馈还使挤出速率 r′ 可以大于吸收速率 r（XOF-256 的 r = 1024 而 r′ = 1280）。","ivLabel":"IV = SM3 派生（实例域串）","finalTag":"末块 C → inner","finalTagNote":"末块注入 C=0^(c−1)‖1 后再保存 inner，使 C 同时进入置换输入与容量前馈。"},
    kind: "lattice",
    rows: 5,
    cols: 5,
    xLabel: "",
    yLabel: "",
    title: "Dragon-p · 5 × 5 条 64 位 lane",
    subtitle: "一格 = 一条 64 位 lane，下标为 S[x,y]（列,行）；r = 1024（16 条 lane）、inner = 576（9 条 lane），25 格合计 1600 位",
    xTicks: ["x = 0","x = 1","x = 2","x = 3","x = 4"],
    yTicks: ["y = 0","y = 1","y = 2","y = 3","y = 4"],
    cellNames: ["S00","S10","S20","S30","S40","S01","S11","S21","S31","S41","S02","S12","S22","S32","S42","S03","S13","S23","S33","S43","S04","S14","S24","S34","S44"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], bits: [0,1,2,3,4,5,6,7], cap: "ι · 轮常数只进 S00", formula: "S[0,0] ← S[0,0] ⊕ RCᵢ　　RCᵢ = 15(i + 1)", note: "RCᵢ=15(i+1)，i=0…15；图中为 16 个 RC 的置位并集，不表示每轮低 8 位均为 1。", bitIndexOrder: "lsb-first", injTitle: "RC 可能置位的范围为低 8 位；每轮只取相应常数" },
      { kind: "columnMix", axis: "diag", index: 2, sym: "ARX", cap: "Diag · Update（含 5 次 mod 2⁶⁴ 加，全置换唯一的非线性来源）", formula: "b ← b ⊞ e,  d ← (d ⋘ 33) ⊕ b\na ← a ⊞ d,  c ← (c ⋘ 24) ⊕ a\ne ← e ⊞ c,  b ← (b ⋘ 10) ⊕ e\nd ← d ⊞ b,  a ← (a ⋘ 1) ⊕ d\nc ← c ⊞ a,  e ← (e ⋘ 49) ⊕ c", detailTitle: "同一个 Update 在其余 4 条对角线并行执行", detail: "Diag_j = (S[0,j], S[1,j+1], …, S[4,j+4])，第二下标模 5。一个 Update = 5 次模 2⁶⁴ 加 + 5 次循环左移 + 5 次异或，旋转量 (r_a,r_b,r_c,r_d,r_e) = (1,10,24,33,49)；5 条对角线互不依赖、可完全并行。", note: "轮函数 R_i = φ ∘ ι_i、φ = Col ∘ Diag，执行序是 ι → Diag → Col。Update 内部 5 个模加严格串行（b⊞e → a⊞d → e⊞c → d⊞b → c⊞a），这条链构成关键路径；模加是整个置换唯一的非线性来源。文档把 Update 分解成 S2 ∘ L ∘ S1 ∘ R，S1 是 3 位进位状态的 S-function、S2 是 2 位的，于是可以套用几何方法与 Mealy 机公式得到精确转移矩阵。", depNote: "5 字联合 ARX，含模加；图中不是 F₂ 线性矩阵" },
      { kind: "columnMix", axis: "column", index: 2, sym: "ARX", cap: "Col · Update（同一个非线性函数，换一个方向）", formula: "column[x] ← Update(column[x])　x = 0…4\n每轮 10 次 Update ⇒ 50 模加 + 50 旋转 + 50 异或", detailTitle: "同一个 Update 在其余 4 个列并行执行", detail: "Col 与 Diag 复用完全相同的五字变换，只是取字的方式不同：一个沿循环对角线、一个沿列。这与 ChaCha 的 column-round / diagonal-round 交替相同，搬到 5×5 上：对角线一遍把信息斜着送出，列一遍再沿另一方向汇合。", note: "Dragon-512 每块 128 字节 ⇒ 每字节 6.25 个模加 + 6.25 个旋转 + 6.25 个异或。正向全扩散 2 轮、逆向 3 轮。硬件上若每周期一轮，Diag + Col 的关键路径含 10 次串行 64 位模加；文档给出 UMC 55 nm 关键路径 3.93 ns、254 MHz。", depNote: "5 字联合 ARX，含模加；图中不是 F₂ 线性矩阵" }
    ]
  };
  S.duet = {
    construction: {"kind":"sponge","dual":true,"feedforward":true,"tag":"交替双分支海绵 · 每块两次置换","perm":"f₁ / f₂","rateBits":"r = 384 bit × 2","capBits":"c = 576 bit","capName":"共享 C","outFrom":"capacity","outLabel":"trunc(C)","outSub":"最后 f₂ 后取 512 位","note":"图示两个完整消息块：A、B、C 初值全零，Pad10* 后每块依次调用 f₁、f₂，各自容量前馈。Duet-512 的 σ 字序为 (3,0,5,1,4,2)。首个输出从末次 f₂ 后的 C 截取；XOF 再交替调用带容量前馈的 F₁、F₂，每次取 h 位，直到满足请求长度。安全界依赖模式分析的具体假设。","capFeedback":true,"msgLabels":["M₀","σ(M₀)","M₁","σ(M₁)"],"railNames":["分支 A","共享容量 C","分支 B"],"ffLabel":"橙色虚线 = 每次置换后把输出容量异或回共享 C（C ← D ⊕ C），一块消息两次"},
    kind: "lattice",
    rows: 5,
    cols: 3,
    xLabel: "",
    yLabel: "",
    title: "Duet f-960 · 5 行 × 3 列的 64 位字",
    subtitle: "一格 = 一个 64 位字 X_{i,j}，5 × 3 = 15 个字 = 960 位；第三维是 64 个 bit-slice，每个 slice 是一张 5 × 3 的比特矩阵",
    xTicks: ["j = 0","j = 1","j = 2"],
    yTicks: ["i = 0","i = 1","i = 2","i = 3","i = 4"],
    cellNames: ["X00","X01","X02","X10","X11","X12","X20","X21","X22","X30","X31","X32","X40","X41","X42"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "column", index: 0, width: 5, cap: "SC · APN 5 位 S 盒", formula: "Y[:, c, z] = S_APN(X[:, c, z])", parallelNote: "× 64 个 bit-slice × 3 列 = 192 次 S 盒调用 / 轮（f-1920 为 384 次）", note: "差分均匀度 2（2⁻⁴，5 位置换的最优）、最大线性相关 4/16 = 2⁻²、代数次数 2、无不动点，并排除了全部 hw(α)=1 的 α→α 模式。S 盒以位切片布尔电路实现，只含 AND、NOT 与 XOR，便于做门级掩码。" },
      { kind: "columnMix", axis: "all", sym: "M", cap: "MS · bit-slice 内整体混合", formula: "slice ← M15 · slice", detailTitle: "同一个 15 × 15 的 0/1 矩阵在 64 个 bit-slice 上并行执行", detail: "在每个 bit-slice 内，15 个位置（5 行 × 3 列）被当作一个 15 维 F₂ 向量左乘 M15；实现里按固定 tap 偏移 +3, +4, +5, +7, +8, +13 (mod 15) 展开成异或树，约 75 次 64 位异或。f-1920 换成 30 × 30 右循环矩阵，首行 v 有 10 个 1，约 270 次异或。这是轮函数里唯一同时跨行、跨列的扩散。", note: "f-960 的块级（3×3 over 5 位块）分支数 4、比特级分支数 8、门深 3；f-1920 对应 6 / 12 / 4。以上数值由文档给出。" },
      { kind: "const", axis: "cells", cells: [[0,0]], cap: "AC · 轮常数只进 X₀,₀", formula: "X₀,₀ ← X₀,₀ ⊕ C_{α, β, γ}", note: "15 个字里只改 1 个（f-1920 是 30 选 1），常数注入较稀疏。f-960 的常数取自 π 的小数部分（f₁、f₂ 各 12 个），f-1920 取自 e（各 18 个）；两张表互不相交，这同时充当 f₁ 与 f₂ 的域分离。" },
      { kind: "laneMix", target: 0, sources: [0,0,0], rotations: [0,21,43], cap: "ML · lane 内三份旋转异或", formula: "X_{i,j} ← (X ⋘ t) ⊕ (X ⋘ t+21) ⊕ (X ⋘ t+43)", supportNote: "三个源其实是同一个字的三份不同旋转，本层没有任何跨字的信息流动；15 个字各按自己的 t = 5j + i 同时执行（图中 Xₙ 即文档的 X_{i,j}，n = 3i + j，这里画的是 t = 0 的 X₀,₀）。", detailTitle: "ML：轮函数里唯一沿 z 方向的扩散", note: "每字 3 次旋转 + 2 次异或 → f-960 每轮 45 旋转 + 30 异或，f-1920 是 90 + 60。文档给出分支数 4；所有 lane 的循环矩阵互不相同，但只差一个循环移位。AVX-512 上 _mm512_rolv_epi64 一条即可完成旋转。", depNote: "输出 Y0 只依赖 X0 一个字的三份不同旋转，本层没有任何跨字的信息流动", sourceLabels: ["X00","X00","X00"], outputLabel: "Y00" }
    ]
  };
  S.eijen = {
    construction: {"kind":"sponge","feedforward":true,"tag":"Sponge-F · pad10*1 · Dₕ","perm":"Π · 2048 位\n16 轮 ARX","rateBits":"r = 1472 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"capacity","outLabel":"摘要 512 bit","outSub":"right_512(X_ℓ)，挤出阶段不再调用置换","ffLabel":"把置换输入的 capacity 前馈异或回置换输出的 capacity","note":"新版 pad10*1：j=(−|M|−2) mod r，不加 SHA-3 的 01 后缀或长度字段。消息位按字节低位优先，字与摘要小端序；末字节只使用有效低位。最后块将 0x8000000000000000 | h 异或到 A[31]，注入后的容量同时参与置换输入与前馈；摘要仍从最终容量取 right_h。","finalTag":"D₅₁₂ → A[31]","finalTagNote":"末块先吸收与注入 Dₕ，再保存容量、置换、容量前馈。Dₕ 最后字 = 0x8000000000000000 | h。"},
    kind: "lattice",
    rows: 4,
    cols: 8,
    xLabel: "列 j",
    yLabel: "行",
    title: "Π · 4 行 × 8 列 × 64 位字",
    subtitle: "一格 = 一个 64 位字 A[i + 4j]；一列 4 格 = MixQuad 的 (a,b,c,d)；4 × 8 = 32 个字 = 2048 位，8 列与 AVX-512 的 8 个 lane 一一对应",
    xTicks: ["j0","j1","j2","j3","j4","j5","j6","j7"],
    yTicks: ["a","b","c","d"],
    cellNames: ["a0","a1","a2","a3","a4","a5","a6","a7","b0","b1","b2","b3","b4","b5","b6","b7","c0","c1","c2","c3","c4","c5","c6","c7","d0","d1","d2","d3","d4","d5","d6","d7"],
    unitName: "字",
    ops: [
      { kind: "wire", sym: "⊞", cap: "MixQuad · 64 位 ARX 四元轮", formula: "每列 4 ⊞ + 4 数据 ⊕ + 1 RC ⊕ + 6 ⋘\n全状态 32 ⊞ + 40 ⊕ + 48 ⋘", perCell: {}, chain: [], chainTitle: "关键路径：一个 MixQuad 里 4 条串行的 64 位进位链", chainNote: "→ 第 4 个 ⊞", leftCap: "一列四字 (a,b,c,d) 联合运算；8 列并行", rightCap: "顺序更新：后续语句读取刚更新的字", detailTitle: "MixQuad 由哪些运算组成", summary: ["每列 4 模加、4 数据异或、1 常数异或和 6 旋转；全状态 32 加 + 40 异或 + 48 旋转。","左半列 0–3 用 p0 = (36,54,45,44,18,9)，右半列 4–7 用 p1 = (56,46,54,34,19,51)，为的是破坏 8 列同构。","相对 ChaCha 多出两处：a ⋘ π4 后注入轮常数，把逆向最高位的确定性差分概率从 1 压到 ≤ 2^-1；c ⋘ π5 把 ∆c 的最优正向差分概率从 2^-2 压到 2^-3。","非线性只来自模加的进位链，没有查表 S 盒；这一层不是 S 盒层。"], assignments: ["a ← a ⊞ b","d ← ROTL64(d ⊕ a,π₀)","a ← ROTL64(a,π₄) ⊕ cᵢ","c ← c ⊞ d","b ← ROTL64(b ⊕ c,π₁)","c ← ROTL64(c,π₅)","a ← a ⊞ b","d ← ROTL64(d ⊕ a,π₂)","c ← c ⊞ d","b ← ROTL64(b ⊕ c,π₃)"] },
      { kind: "permute", samples: [[0,0],[5,2],[3,1],[7,3]], cap: "PosPerm · 第一次", formula: "ρ(4j + i) = 4·((j + s_i) mod 8) + t_i\n(s₀..s₃) = (0,1,3,4)　(t₀..t₃) = (1,2,0,3)", note: "一个输入列的 4 个字被分到列 {j, j+1, j+3, j+4}，同时行 0→1、1→2、2→0、3→3；硬件上为布线。", labelAllSources: true, map: function (x, y) { return [(x+[0,1,3,4][y])%8,[1,2,0,3][y]]; } },
      { kind: "columnMix", axis: "column", index: 0, sym: "L", detailTitle: "J − I（4×4，分支数 4，almost MixColumn）", detail: "W_i = ⊕_{k≠i} U_k；4 个输出各需 2 次 XOR，朴素为 8 XOR/列、64 XOR/状态。先算 T=U₀⊕U₁⊕U₂⊕U₃ 再 W_i=T⊕U_i，为 7 XOR/列、56 XOR/状态。", cap: "AMix4 · 列混合", formula: "T = U₀ ⊕ U₁ ⊕ U₂ ⊕ U₃\nW_i = T ⊕ U_i，i=0…3", note: "每个输出为同列其余三个字的异或和；8 列独立进行。" },
      { kind: "permute", samples: [[0,0],[5,2],[3,1],[7,3]], cap: "PosPerm · 第二次", formula: "同一个 ρ 再作用一次\n活跃列 1 → 3 → 8，全扩散 3 轮", note: "一轮里 PosPerm 出现两次、夹住 AMix4，是 Eijen 的结构特征；两次都只改变字的位置。", labelAllSources: true, map: function (x, y) { return [(x+[0,1,3,4][y])%8,[1,2,0,3][y]]; } }
    ]
  };
  S.feilian = {
    construction: {"kind":"chain","tag":"定制 HAIFA · Davies–Meyer","box":"压缩函数 FEILIAN-f","boxSub1":"5 相位 × 4 轮 = 20 轮","boxSub2":"单密钥迭代 Even–Mansour，消息每相位注入一次","chainBits":"链值 1024 bit（窄管道）","finalBox":"末块：flag 置全 1","finalSub1":"tweak (ver, flag, t) 每轮注入","finalSub2":"1024 → 512 / 768 / 1024 截断","note":"HAIFA 的定制变体：去掉 salt 只留 128 位计数器，加一个 flag 字，并把 (ver, flag, t) 组成的 256 位 tweak 在 20 轮里注入 20 次。填充是纯零填充，单射性依靠计数器精确记录原始比特长度；公开论坛指出，若计数器按填充后长度累计，将丢失末块的逻辑长度。末块 flag 置全 1 做域分离，长度扩展因此不适用。","dmFeedback":true,"dmLabel":"块内 Davies–Meyer 前馈：h′ = h ⊕ P₄∘P₃∘P₂∘P₁∘P₀(h, m)，完全发生在同一次压缩调用内部","msgLabels":["m1 · tw = (ver, flag, t₀, t₁)","m2 · tw = (ver, flag, t₀, t₁)"]},
    kind: "lattice",
    rows: 4,
    cols: 4,
    xLabel: "col",
    yLabel: "row",
    title: "FEILIAN-f · 4 × 4 的 64 位字矩阵",
    subtitle: "一格 = 一个 64 位字 v[4·row+col]；一列的 4 个字组成一个 SubColumn，一行 4 × 64 = 256 bit 恰好是一个 ymm；16 格合计 1024 bit",
    bands: [{"from":[0,0],"to":[3,0],"label":"一行 = 1 个 ymm","color":"#3f85d6"}],
    cellNames: ["v0","v1","v2","v3","v4","v5","v6","v7","v8","v9","v10","v11","v12","v13","v14","v15"],
    unitName: "字",
    ops: [
      { kind: "const", axis: "cells", cap: "M低半 · 注入 m₀…m₇", formula: "v[0,c] ⊕= m[c]；v[2,c] ⊕= m[4+c]", selCap: "只注入第 0、2 行", note: "R⊕̂ 的完整次序是：注入 m₀…m₇ → SC 层 → ShiftRow → 注入 m₈…m₁₅ → SC 层 → ShiftRow → AC。也就是说一块消息分两次半块注入，中间隔着一整层 SubColumn 与 ShiftRow。", cells: [[0,0],[1,0],[2,0],[3,0],[0,2],[1,2],[2,2],[3,2]], injSym: "⊕ m", injShort: "m", injTitle: "这一步注入的是消息半块，不是轮常数", passNote: "第 1、3 行本步不注入；高半消息也在后续注入第 0、2 行" },
      { kind: "wire", sym: "SC", cap: "SC₁ · 四列并行 ARX", formula: "a ← s₀+s₁;  d ← (s₃⊕a)ROTR 8;  c ← (s₂+s₃)+Σ₀(d)\nb ← (s₁⊕c)ROTR 63;  a ← a+Σ₁(b)\nΣ₀ = x⊕(xROTR 5)⊕(xROTR 48)　Σ₁ = x⊕(xROTR 11)⊕(xROTR 40)", perCell: {"v0":["⊞ s₁","⊞ Σ₁(b)"],"v1":["⊞ s₁","⊞ Σ₁(b)"],"v2":["⊞ s₁","⊞ Σ₁(b)"],"v3":["⊞ s₁","⊞ Σ₁(b)"],"v4":["⊕ c","≫63"],"v5":["⊕ c","≫63"],"v6":["⊕ c","≫63"],"v7":["⊕ c","≫63"],"v8":["⊞ s₃","⊞ Σ₀(d)"],"v9":["⊞ s₃","⊞ Σ₀(d)"],"v10":["⊞ s₃","⊞ Σ₀(d)"],"v11":["⊞ s₃","⊞ Σ₀(d)"],"v12":["⊕ a","≫8"],"v13":["⊕ a","≫8"],"v14":["⊕ a","≫8"],"v15":["⊕ a","≫8"]}, chainTitle: "第 0 列的顺序更新（输出 a,b,c,d）", chainNote: "3 条串行进位链", leftCap: "格内是该字在 SubColumn 里承受的运算", rightCap: "4 列彼此独立，一轮两层共 8 个 SubColumn", detailTitle: "为什么这里不是位切片 S 盒", summary: ["SubColumn 是作用在 4 × 64 位上的 ARX 变换，不能按 z 切片拆开：同一列的 4 个字通过模加的进位链耦合在一起，唯一的非线性就是 mod 2⁶⁴ 加法，没有查表也没有有限域乘法。","一个 SubColumn = 4 次模加 + 6 次异或 + 6 次旋转；全压缩 20 轮 × 2 层 × 4 列 = 640 加 / 1216 异或 / 960 旋转。","关键路径是 a → d → c → b → a 这条链上的 3 个串行 64 位加法器；[8SC] 一轮两层串联 6 个，[4SC]、[1SC] 每拍只有 3 个，硬件各档的时钟频率因此不同。","旋转量 8、40、48 是字节的整数倍，可按字节重排实现；5、11、63 不是字节倍数，需要移位与或运算。"], assignments: ["a = s₀ ⊞ s₁","c = s₂ ⊞ s₃","d = ROTR₈(s₃ ⊕ a)","c = c ⊞ Σ₀(d)","b = ROTR₆₃(s₁ ⊕ c)","a = a ⊞ Σ₁(b)"] },
      { kind: "laneShift", axis: "row", amount: function (i) { return [0,1,2,3][i]; }, sample: 2, unitName: "行", cap: "SR₁ · 行循环左移", formula: "行 i ← 行 i 循环左移 i 格　（i = 0…3）\n一轮执行两次，20 轮共 40 次", note: "只改字在阵列里的位置，不改字内部的比特；每行正好是一个 256 位寄存器，RTL 里是位拼接的纯布线。FEILIAN 没有 MixColumn，扩散全靠它与 SubColumn 的耦合。", dir: "left" },
      { kind: "const", axis: "cells", cap: "M高半 · 注入 m₈…m₁₅", formula: "v[0,c] ⊕= m[8+c]；v[2,c] ⊕= m[12+c]", selCap: "SC₁ + SR₁ 之后，再注入同一组行", note: "R⊕̂ 的完整次序是：注入 m₀…m₇ → SC 层 → ShiftRow → 注入 m₈…m₁₅ → SC 层 → ShiftRow → AC。也就是说一块消息分两次半块注入，中间隔着一整层 SubColumn 与 ShiftRow。", cells: [[0,0],[1,0],[2,0],[3,0],[0,2],[1,2],[2,2],[3,2]], injSym: "⊕ m", injShort: "m", injTitle: "这一步注入的是消息半块，不是轮常数", passNote: "第 1、3 行本步不注入；高半消息也在后续注入第 0、2 行" },
      { kind: "wire", sym: "SC", cap: "SC₂ · 第二组四列 ARX", formula: "a ← s₀+s₁;  d ← (s₃⊕a)ROTR 8;  c ← (s₂+s₃)+Σ₀(d)\nb ← (s₁⊕c)ROTR 63;  a ← a+Σ₁(b)\nΣ₀ = x⊕(xROTR 5)⊕(xROTR 48)　Σ₁ = x⊕(xROTR 11)⊕(xROTR 40)", perCell: {"v0":["⊞ s₁","⊞ Σ₁(b)"],"v1":["⊞ s₁","⊞ Σ₁(b)"],"v2":["⊞ s₁","⊞ Σ₁(b)"],"v3":["⊞ s₁","⊞ Σ₁(b)"],"v4":["⊕ c","≫63"],"v5":["⊕ c","≫63"],"v6":["⊕ c","≫63"],"v7":["⊕ c","≫63"],"v8":["⊞ s₃","⊞ Σ₀(d)"],"v9":["⊞ s₃","⊞ Σ₀(d)"],"v10":["⊞ s₃","⊞ Σ₀(d)"],"v11":["⊞ s₃","⊞ Σ₀(d)"],"v12":["⊕ a","≫8"],"v13":["⊕ a","≫8"],"v14":["⊕ a","≫8"],"v15":["⊕ a","≫8"]}, chainTitle: "第 0 列的顺序更新（输出 a,b,c,d）", chainNote: "3 条串行进位链", leftCap: "格内是该字在 SubColumn 里承受的运算", rightCap: "4 列彼此独立，一轮两层共 8 个 SubColumn", detailTitle: "为什么这里不是位切片 S 盒", summary: ["SubColumn 是作用在 4 × 64 位上的 ARX 变换，不能按 z 切片拆开：同一列的 4 个字通过模加的进位链耦合在一起，唯一的非线性就是 mod 2⁶⁴ 加法，没有查表也没有有限域乘法。","一个 SubColumn = 4 次模加 + 6 次异或 + 6 次旋转；全压缩 20 轮 × 2 层 × 4 列 = 640 加 / 1216 异或 / 960 旋转。","关键路径是 a → d → c → b → a 这条链上的 3 个串行 64 位加法器；[8SC] 一轮两层串联 6 个，[4SC]、[1SC] 每拍只有 3 个，硬件各档的时钟频率因此不同。","旋转量 8、40、48 是字节的整数倍，可按字节重排实现；5、11、63 不是字节倍数，需要移位与或运算。"], assignments: ["a = s₀ ⊞ s₁","c = s₂ ⊞ s₃","d = ROTR₈(s₃ ⊕ a)","c = c ⊞ Σ₀(d)","b = ROTR₆₃(s₁ ⊕ c)","a = a ⊞ Σ₁(b)"] },
      { kind: "laneShift", axis: "row", amount: function (i) { return [0,1,2,3][i]; }, sample: 2, unitName: "行", cap: "SR₂ · 再次行循环左移", formula: "行 i ← 行 i 循环左移 i 格　（i = 0…3）\n一轮执行两次，20 轮共 40 次", note: "只改字在阵列里的位置，不改字内部的比特；每行正好是一个 256 位寄存器，RTL 里是位拼接的纯布线。FEILIAN 没有 MixColumn，扩散全靠它与 SubColumn 的耦合。", dir: "left" },
      { kind: "const", axis: "cells", cells: [[0,1],[1,1],[2,1],[3,1],[0,3],[1,3],[2,3],[3,3]], cap: "AddConstant · 相位常数 + 256 位 tweak", formula: "按参考 C 实现：第 1 行 ⊕= (C′₀,C′₁,C′₂,C′₃)\n第 3 行 ⊕= (ver,flag,t₀,t₁)", selCap: "16 个字里只有两行共 8 个参与", note: "图按参考 C 实现：常数进第 1 行，tweak 进第 3 行；公开论坛指出文档与实现的 AddConstant 位置不一致。常数 C₀=6A09E667F3BCC908；tweak 每轮注入。普通轮 R 仅省去两次消息注入，仍执行两组 SC/SR 和 AC。" }
    ]
  };
  S.garnet = {
    construction: {"kind":"sponge","feedforward":false,"tag":"海绵 · 初始化、吸收、长度注入与中间处理、挤出前置换","perm":"Absorb\n10 轮","rateBits":"r = 1024 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"both","outLabel":"摘要 512 bit","outSub":"H = S₁₄‖S₉‖S₇‖S₀：S₇ 与 S₁₄ 不在速率图样里","note":"Garnet-512 的轮数为 Init 14、Absorb 10、Middle 14、Squeeze 10。消息全部吸收后，把原始消息长度 mlength 按同样的串行化约定注入 rate，再执行 Middle 与 Squeeze 两次置换，最后按固定图样抽取摘要。图中 rate 表示离散吸收图样的合计宽度，并非连续前半状态。Garnet-1024a 按文档采用全状态 DM 前馈。","ivLabel":"IV 含 π 常量、摘要长度与 counter","phases":{"init":"Init\n14 轮","initSub":"可预计算","absorbSub":"每块一次","lenTag":"mlength","mid":"Middle\n14 轮","squeeze":"Squeeze\n10 轮","tailSub":"中间处理 · 挤出"}},
    kind: "lattice",
    rows: 4,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "P · 16 个 128 位字排成 4×4",
    subtitle: "一格 = 一个 128 位字 S_j（j = 4y + x）= 一条 aesenc 的操作数 = AES 的 4×4 字节矩阵；16 格合计 2048 位",
    xTicks: ["列 0","列 1","列 2","列 3"],
    yTicks: ["行 0","行 1","行 2","行 3"],
    cellNames: ["S₀","S₁","S₂","S₃","S₄","S₅","S₆","S₇","S₈","S₉","S₁₀","S₁₁","S₁₂","S₁₃","S₁₄","S₁₅"],
    unitName: "字",
    ops: [
      { kind: "aesRound", steps: ["ShiftRows","SubBytes","MixColumns ⊕ B"], captions: ["行 i 左移 i 个字节","lane 内 16 个 AES S 盒","列 MDS，之后把域分离量 B 从 aesenc 的第二操作数异或进来"], cap: "σ · AESL（16 个字并行）", formula: "AESL(S, B) = MixColumns ∘ SubBytes ∘ ShiftRows", laneCount: 16, note: "一个字 = 一条 aesenc，全状态每轮 256 个 AES S 盒。阶段标签 B 走 aesenc 的第二操作数，在 MixColumns 之后异或进来；它不是密钥，而是 Init/Absorb/Middle/Squeeze 的域分离量。", inCap: "16 个字各过一次 aesenc", depNote: "域分离量 B 从 aesenc 的第二操作数进来，这一层不跨字" },
      { kind: "columnMix", axis: "column", index: 0, sym: "T1", detailTitle: "ρ：列向的 GF(2¹²⁸) MDS（第一个本原多项式）", detail: "同一列的 4 个 128 位字乘 4×4 矩阵 T1，元素只取 1、α、α+1，域为 GF(2¹²⁸) 模 x¹²⁸+x⁷+x²+x+1，字级分支数 5。一次 α-乘 = 一次 128 位左移 1 + 一次条件异或（约化常量 0x87），全状态每轮 16 次 α-乘 + 48 次 128 位异或。", cap: "ρ · MixColumn", formula: "ρ：列 × T1，分支数 5\n模 x¹²⁸ + x⁷ + x² + x + 1", note: "4 列同构；T1 的具体元素排布见文档。与下面的 ζ 相比，这一层的域是第一个本原多项式。" },
      { kind: "const", axis: "cells", cells: [[3,1],[3,2],[3,3]], cap: "θ · AddConstant", formula: "S₇ ⊕ c₀(r)，S₁₁ ⊕ c₁(r)，S₁₅ ⊕ c₂(r)\n首轮 (c₀,c₁,c₂) = (1,1,2)", selCap: "16 个字里只有最右一列的 3 个参与（S₃ 不动）", note: "常数取 Fibonacci 数列，Table 1 共 16 行 × 3，每轮取一行。各阶段之间的域分离由 AESL 的第二操作数 B 承担。", injTitle: "每轮分别注入 3 个 Fibonacci 数；此处不虚构置位图案" },
      { kind: "columnMix", axis: "diag", index: 0, sym: "T2", detailTitle: "ζ：对角向的 GF(2¹²⁸) MDS（第二个本原多项式）", detail: "同一条对角线的 4 个字乘另一个 4×4 矩阵 T2，分支数同样是 5，但域换成 GF(2¹²⁸) 模 x¹²⁸+x²⁹+x¹⁵+x²+1。两层 MDS 刻意不共用一个域：同一个字节边界在 ρ 与 ζ 里被以两种不同方式切开，作者以此论证 Super-S-box 型的局部二三轮分析难以成立。", cap: "ζ · MixDiagonal", formula: "ζ：对角线 × T2，分支数 5\n模 x¹²⁸ + x²⁹ + x¹⁵ + x² + 1", note: "ρ 按列、ζ 按对角线，方向正交，两者合起来一轮即全状态字级完全扩散；字级分支数合计 5 + 5。T2 的具体元素排布见文档。" }
    ]
  };
  S.iphe = {
    construction: {"kind":"sponge","feedforward":true,"tag":"Sponge-F · pad10*1","perm":"f · 2048 位\n25 小轮","rateBits":"r = 1472 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"capacity","outLabel":"摘要 512 bit","outSub":"直接取 capacity 的前 d 位，一次挤出即够","ffLabel":"吸收前的 capacity 异或回置换输出","note":"新版 IV=f(0^d‖1^(2048−d))，按摘要长度 d 构造预置串，再用同一 25 小轮置换生成初态。pad10*1；每块容量前馈；摘要从容量取文档规定的 d 位。原零 IV 的跨实例后缀关系不能直接沿用到新版。","ivLabel":"IV = f(0^d ‖ 1^(2048−d))"},
    kind: "lattice",
    rows: 4,
    cols: 8,
    xLabel: "",
    yLabel: "",
    title: "f[2048] · 32 条 64 位字 lane",
    subtitle: "一格 = 一个 64 位字 S_i，下标 i = 8y + x；32 格合计 2048 位；小轮把连续下标切成 n/l 组，l 从 2 字逐小轮翻倍到 32 字",
    xTicks: ["+0","+1","+2","+3","+4","+5","+6","+7"],
    yTicks: ["S0–7","S8–15","S16–23","S24–31"],
    cellNames: ["S0","S1","S2","S3","S4","S5","S6","S7","S8","S9","S10","S11","S12","S13","S14","S15","S16","S17","S18","S19","S20","S21","S22","S23","S24","S25","S26","S27","S28","S29","S30","S31"],
    unitName: "字",
    ops: [
      { kind: "const", axis: "cells", cells: [[0,0],[2,0],[4,0],[6,0],[0,1],[2,1],[4,1],[6,1],[0,2],[2,2],[4,2],[6,2],[0,3],[2,3],[4,3],[6,3]], cap: "AC · 只注入每组首字", formula: "rc[i, ir, Ir] = α[i] ⊕ β[ir] ⊕ γ[Ir]\n注入点数 = n / l", selCap: "l = 2 时 16 个组各注入一个常数", note: "图示是 l = 2（16 组）的情形；步长更大的小轮组更长、注入点更少，l = 32 时整轮只剩 1 个注入点。", injTitle: "按组号与轮号生成常数，只注入每组首字" },
      { kind: "directions", current: 0, cap: "GM · 组混合，组长逐小轮加倍", formula: "TS_l(a) = TS_{l/2}(a) ⊞ TS_{l/2}(a+l/2)（log2 l 为奇）；为偶时换成 ⊕", detailTitle: "五个小轮在同一个大轮里依次执行（Rnd = rnd^{nr}，5 小轮 = 1 大轮，共 5 大轮 25 小轮）", note: "组内 l 个字交替 ⊞/⊕ 二叉归约得 u_i，再按 D_l(i) = rev_q((rev_q(i)+1) mod 2^q) 写回另一组：首字 ⊞ µ_0·u，其余字 ⊕ µ_j·u，µ_j = 1 + 2^{j+1}。", sequential: true, panelLabels: ["第 1 个小轮","第 2 个","第 3 个","第 4 个","第 5 个"], groupCounts: [16,8,4,2,1], showAll: true, examples: ["16 组","8 组","4 组","2 组","1 组"], directions: [
        { label: "小轮 0 · l = 2", group: function (c, r) { return (8*r+c)>>1; } },
        { label: "小轮 1 · l = 4", group: function (c, r) { return (8*r+c)>>2; } },
        { label: "小轮 2 · l = 8", group: function (c, r) { return (8*r+c)>>3; } },
        { label: "小轮 3 · l = 16", group: function (c, r) { return (8*r+c)>>4; } },
        { label: "小轮 4 · l = 32", group: function (c, r) { return (8*r+c)>>5; } }
      ] },
      { kind: "wire", sym: "ρ", cap: "WR · 逐字固定左旋", formula: "S_i ← S_i ⋘ ρ_i\nρ_i = ((7i) mod 32) + 16 ∈ [16, 47]", perCell: {"S0":["⋘16"],"S1":["⋘23"],"S2":["⋘30"],"S3":["⋘37"],"S4":["⋘44"],"S5":["⋘19"],"S6":["⋘26"],"S7":["⋘33"],"S8":["⋘40"],"S9":["⋘47"],"S10":["⋘22"],"S11":["⋘29"],"S12":["⋘36"],"S13":["⋘43"],"S14":["⋘18"],"S15":["⋘25"],"S16":["⋘32"],"S17":["⋘39"],"S18":["⋘46"],"S19":["⋘21"],"S20":["⋘28"],"S21":["⋘35"],"S22":["⋘42"],"S23":["⋘17"],"S24":["⋘24"],"S25":["⋘31"],"S26":["⋘38"],"S27":["⋘45"],"S28":["⋘20"],"S29":["⋘27"],"S30":["⋘34"],"S31":["⋘41"]}, leftCap: "格内数字 = 该字的左旋量 ρ_i", rightCap: "32 个字同时旋转，位置完全不变", detailTitle: "32 个字各自的左旋量", summary: ["7 与 32 互素，32 个旋转量两两不同；偏移 (w−n)/2 = 16 把取值压进 [16, 47]。","ρ_i 只依赖字下标，与小轮号、大轮号都无关，每个小轮的旋转量完全相同。","硬件上纯布线零成本；800 次固定旋转占全部 4645 次字操作的 17%。"] },
      { kind: "permute", samples: [[0,0],[1,0],[2,0],[7,3]], cap: "WP · 完美洗牌的逆", formula: "S'_i = S_{2i} (i < 16)\nS'_i = S_{2(i−16)+1} (i ≥ 16)", note: "纯字级搬移，5 个小轮后所有字回到原位，周期恰好等于一个大轮的小轮数。", labelAllSources: true, map: function (x, y) { return [((((y*8+x)>>1)+16*((y*8+x)&1))&7),((((y*8+x)>>1)+16*((y*8+x)&1))>>3)]; } }
    ]
  };
  S.juzihash = {
    construction: {"kind":"sponge","tag":"JuziHash-512 · 零扩展 + 1024 位长度块","perm":"P\n2048 位 · 24 轮","rateBits":"r = 1024 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"取 S0‖S1（rate 前半）","note":"512 实例消息注入 S0/S1/S4/S5，摘要取 S0‖S1。消息零扩展后另追加一个 1024 位长度块（其中编码 64 位原始长度）；空消息也只有一个填充块。1024 实例使用容量前馈，文档给出其长消息第二原像界随消息长度降低。","ivLabel":"H⁽⁰⁾ = P²⁴(0x0200‖0²⁰³²)","msgLabels":["M₁","Mₜ‖0*","Len₁₀₂₄(|M|)"]},
    kind: "lattice",
    rows: 8,
    cols: 4,
    xLabel: "字",
    yLabel: "寄存器",
    title: "Juzi 置换 · 8 个寄存器 × 4 个 64 位字",
    subtitle: "一格 = 一个 64 位字 = 8 个字节；一行 4 格 = 一个 256 位寄存器 S_i（正好一个 YMM）；32 格合计 2048 位，概念上是四维字节数组 T[a][b][c][d]",
    bands: [{"from":[0,0],"to":[3,1],"label":"Rate S0∥S1","color":"#3f85d6"},{"from":[0,2],"to":[3,3],"label":"Capacity S2∥S3","color":"#8a8f98"},{"from":[0,4],"to":[3,5],"label":"Rate S4∥S5","color":"#3f85d6"},{"from":[0,6],"to":[3,7],"label":"Capacity S6∥S7","color":"#8a8f98"}],
    xTicks: ["字 0","字 1","字 2","字 3"],
    yTicks: ["S0","S1","S2","S3","S4","S5","S6","S7"],
    cellNames: ["S0.0","S0.1","S0.2","S0.3","S1.0","S1.1","S1.2","S1.3","S2.0","S2.1","S2.2","S2.3","S3.0","S3.1","S3.2","S3.3","S4.0","S4.1","S4.2","S4.3","S5.0","S5.1","S5.2","S5.3","S6.0","S6.1","S6.2","S6.3","S7.0","S7.1","S7.2","S7.3"],
    unitName: "64 位字",
    ops: [
      { kind: "const", axis: "cells", cells: [[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1]], cap: "AddConstant（每 4 轮一次）", selCap: "32 个字里只有 S0∥S1 的 8 个参与", formula: "每组先 ⊕RC[g] 一次，再执行 4 轮 SB→MDS→BP\n24 轮共 6 组；RC[g] 覆盖 S0∥S1", note: "一格恰好接一个 64 位常数字，8 格 = 512 位常数，其余 1536 位为零；24 轮只需 6 组常数。" },
      { kind: "laneFunc", sample: [0,0], sym: "S", cap: "SubBytes", innerTitle: "8 位 S 盒的内部：4 位 S4 的 3 轮 Feistel", formula: "L_{k+1} = R_k,  R_{k+1} = L_k ⊕ S4(R_k)", note: "一格 = 8 个字节，各自独立过同一个 8 位 S 盒；32 格合计 256 个并行 S 盒 / 轮。S4 = [9,0,4,11,13,12,3,15,1,10,2,6,7,5,8,14]，可在向量寄存器内用字节洗牌查表，无秘密相关的内存访问。", ladder: {"left":"L","right":"R","inLabel":"输入：一格 64 位字里的一个字节，拆成 L₀ ∥ R₀ 两个 4 位半","outLabel":"输出 S(x) = L₃ ∥ R₃，最大差分概率 2⁻⁴","rounds":[{"f":"S4","note":"R₁ = L₀ ⊕ S4(R₀)"},{"f":"S4","note":"R₂ = L₁ ⊕ S4(R₁)"},{"f":"S4","note":"R₃ = L₂ ⊕ S4(R₂)"}]}, inCap: "图中高亮的是示例格，其余同样处理" },
      { kind: "columnMix", axis: "column", index: 0, sym: "M", cap: "MDS", detailTitle: "AES MixColumns，方向固定", detail: "一列 8 格 = 8 个寄存器在同一个字位置上的 64 个字节。对其中每个字节位置 j，(S0,j…S3,j) 与 (S4,j…S7,j) 各乘一次 4×4 MDS，一列合计 16 次 MDS；全状态 4 列 = 64 次。分支数 5。", formula: "M = [[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]]   over  F₂[z]/(z⁸+z⁴+z³+z+1)", note: "作者 9 月 24 日已确认：附录 A.3 和实现的固定分组正确，正文按维度轮换的叙述需勘误。图按实现显示两个独立 MDS 组。", inCap: "一列 8 个字分成 (S0..S3) 与 (S4..S7) 两组", depNote: "每组各乘一次 4×4 MDS：S0 的输出永远不依赖 S4…S7", groupBy: "half" },
      { kind: "directions", current: 0, cap: "BytePerm", formula: "t ≡ 0：每 4 字节组内左旋 (i mod 4) 字节　　t ≡ 1：每 16 字节组内左旋 4(i mod 4) 字节\nt ≡ 2：(S_i, S_{i+4}) 当作 512 位串左旋 16i 字节　　i = 寄存器号", note: "颜色显示分组作用域：mode 0 的 4 字节组小于一格，需在下方示例看清；mode 1 跨两格；mode 2 跨两行。不把 64 位格当成 4 字节组。", detailTitle: "三种分组视图 · 放大到单个字节后理解", panelLabels: ["每格含 2 个独立 4 字节组","每组跨同一行相邻 2 格","同列行 i 与 i+4 合成 512 位组"], examples: ["mode 0：输入字节 [0 1 2 3] → [1 2 3 0]（i=1）","mode 1：16 字节组左旋 4 字节（i=1）","mode 2：(S1,S5) 的 64 字节串左旋 16 字节"], groupCounts: [64,16,4], showAll: true, directions: [
        { label: "t ≡ 0 (mod 3) · 4 字节组", group: function (c, r) { return 4*r+c; } },
        { label: "t ≡ 1 (mod 3) · 16 字节组", group: function (c, r) { return 2*r+(c-c%2)/2; } },
        { label: "t ≡ 2 (mod 3) · 512 位串", group: function (c, r) { return r%4; } }
      ] }
    ]
  };
  S.laurus = {
    construction: {"kind":"chain","tag":"HVFB · VFB [LLHL26] 的变体","box":"g₀ → P → 全状态前馈","boxSub1":"P 输入：计数器 64 + 状态 1536 位","boxSub2":"P 输出状态 ⊕ g₀ 低 1536 位","chainBits":"链值 1536 bit","finalBox":"g₁ · 并行终结","finalSub1":"P(1‖d‖[i]‖g₁ 高半)","finalSub2":"低 1088 位 ⊕ g₁ 低 1088 位","note":"g0(x) = MSB_b(x)‖(LSB_r(x)‖MSB_c(x))，g1(x) = LSB_b(x)‖LSB_{t+b−c}(x)；初始状态 S0 = [2^63·fid + c]_1536。与 Litchi 共用同一个置换，差异全在这一层：消息块与链值先经 g0 扩成 2b 位再做 1536 位全状态前馈，而不是海绵式的只异或 rate。末块固定 512 位；终结输出每块 1088 位，按计数器 i 并行后截到请求长度。通用 c=1024,fid=0/1 的域分离缺陷已由作者确认，但命名 Laurus-XOF 使用 c=512。重复三份 512 位 IV 的方案仍为未来勘误建议，图维持原 IV。"},
    kind: "lattice",
    rows: 5,
    cols: 5,
    xLabel: "lane",
    yLabel: "plane",
    title: "P[1600] · 5 plane × 5 lane",
    subtitle: "一格 = 一条 64 位 lane；一行 5 格 = 一个 320 位 plane（θ 的作用域），一列 5 格 = 一个 column（χ 的作用域）；25 格合计 1600 位，与 Litchi 共用",
    xTicks: ["lane 0","lane 1","lane 2","lane 3","lane 4"],
    yTicks: ["plane 0","plane 1","plane 2","plane 3","plane 4"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], cap: "ι · 只动 A[0][0]", formula: "B[0][0] = A[0][0] ⊕ RC_r\nC = 0xb7e151628aed2a6a（e 小数部分前 64 位）\nRC_r = 2^r ⊗ C  mod  x^64+x^63+x^62+x^54+x^40+x^35+x^15+x+1", note: "25 条 lane 里只有这一条被改写，整轮只花 1 次 64 位异或；16 个 RC 列在文档 Table 2-1，末值 0x674bb286a9aa8b42。这是轮函数里唯一随轮号变化、也是唯一破坏轮间对称的一步。" },
      { kind: "sbox", axis: "column", index: 0, width: 5, parallelNote: "5 列 × 64 个 z 切片 = 320 个并行 S 盒 / 轮", cap: "χ · 跨 plane 的 5 位 S 盒", formula: "B[4] = A[3]&A[4] ⊕ A[0];  B[3] = A[2]&A[3] ⊕ A[4];  B[2] = A[1]&A[2] ⊕ A[3]\nB[1] = B[4]&A[1] ⊕ A[2];  B[0] = B[4]&B[3] ⊕ A[1]\n电路形式共 5 个 AND + 5 个 XOR（ANF 直写要 21 次位运算）", note: "一列的 5 个格子来自 5 个 plane 的同一 (lane, bit) 位置。查表 [0,2,4,23,8,10,14,13,16,18,20,15,28,30,26,17,1,19,5,6,9,27,31,12,25,11,29,22,21,7,3,24]；代数次数 3（逆亦 3）、最大差分概率与最大线性偏差都是 2⁻²、差分与线性分支数都是 2（DDT/LAT 里重量 1→1 的点各只有 5 个）。" },
      { kind: "columnMix", axis: "row", index: 0, sym: "Θ", detailTitle: "Theta[t0..t4] · 分支数 12", detail: "一行 5 条 lane 就是一个 plane（320 位），独立过一个线性置换：先取 5 条 lane 的异或和 E 与旋转异或和 F，再把 E 的逐 lane 旋转与 F 一起打回每条 lane。Theta 的转置等于自身、显式可逆；四条参数约束同时成立时差分与线性分支数都达到 12，而 Keccak 的 θ 只有 4，硬件深度却相同。", cap: "θ · 逐 plane 线性扩散", formula: "E = ⊕ X_i;   F = ⊕ (X_i ⋘ t_i);   Y_i = X_i ⊕ (E ⋙ t_i) ⊕ F\nθ0 = [31,1,4,21,22]   θ1 = [19,12,15,34,13]   θ2 = [28,35,58,9,23]\nθ3 = [55,18,5,27,44]   θ4 = [14,43,53,20,25]\n约束：2t_i ≠ 2t_j、t_i ≠ −t_j、t_i + t_j ≠ 2t_k、t_i + t_j ≠ t_k + t_l  (mod 64)", note: "每 plane 18 次 64 位异或 + 10 次循环移位，全状态 90 XOR + 50 rot；旋转与转置在硬件上都是纯布线。循环移位已并入这一步，所以设计里没有独立的 ρ 层。" },
      { kind: "permute", samples: [[1,0],[2,3],[4,4],[0,1]], cap: "π · 纯 lane 换位", formula: "B[i][j] = A[(i + 2j) mod 5][(3i + 3j) mod 5]", note: "把同一 plane 的 5 条 lane 打散到 5 个不同 plane，且保证同 plane 的任两条 lane 不落进同一 column，后一条是为了保住 θ 的分支数 12。结构上相当于 Keccak 的 ρ∘π，但旋转部分已被 θ 吸收，所以 π 只剩换位，软硬件都是零成本。", labelAllSources: true, map: function (x, y) { return [(y+3*x)%5,(4*x+4*y)%5]; } }
    ]
  };
  S.litchi = {
    construction: {"kind":"sponge","feedforward":true,"tag":"Sponge-F [GHJ+25] + 计数器并行挤出","perm":"P\n1600 位 · 16 轮","rateBits":"r = 1024 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"capacity","outLabel":"摘要 512 bit","outSub":"定长取 h₁ 前 h 位；XOF 各块由同一前缀分支","ffLabel":"上一状态的 capacity 异或回置换输出的 capacity","note":"普通块容量前馈；最后消息块必须与容量计数器 [i]_c 一起注入，再置换与容量前馈。定长使用 i=1；XOF 各输出使用同一个 S_(ℓ−1) 和末消息块，只改变 i，各分支可并行。IV=[2^63·fid+c]_1600；pad10*。","ivLabel":"IV = [2⁶³·fid + c]₁₆₀₀","finalTag":"末块 [i] → capacity","finalTagNote":"定长摘要用 i=1；ST=S_(ℓ−1)⊕(M_(ℓ−1)‖[i]_c)，h_i=LSB_c(P(ST))⊕LSB_c(ST)。"},
    kind: "lattice",
    rows: 5,
    cols: 5,
    xLabel: "lane",
    yLabel: "plane",
    title: "P[1600] · 5 plane × 5 lane",
    subtitle: "一格 = 一条 64 位 lane；一行 5 格 = 一个 320 位 plane（θ 的作用域），一列 5 格 = 一个 column（χ 的作用域）；25 格合计 1600 位，置换定义与 Laurus 文档相同",
    xTicks: ["lane 0","lane 1","lane 2","lane 3","lane 4"],
    yTicks: ["plane 0","plane 1","plane 2","plane 3","plane 4"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], cap: "ι · 只动 A[0][0]", formula: "B[0][0] = A[0][0] ⊕ RC_r\nC = 0xb7e151628aed2a6a（e 小数部分前 64 位）\nRC_r = 2^r ⊗ C  mod  x^64+x^63+x^62+x^54+x^40+x^35+x^15+x+1", note: "25 条 lane 里只有这一条被改写，整轮只花 1 次 64 位异或；16 个 RC 列在文档 Table 2-1，末值 0x674bb286a9aa8b42。这是轮函数里唯一随轮号变化的一步，也是唯一打破轮间对称的一步。" },
      { kind: "sbox", axis: "column", index: 0, width: 5, parallelNote: "5 列 × 64 个 z 切片 = 320 个并行 S 盒 / 轮", cap: "χ · 跨 plane 的 5 位 S 盒", formula: "B[4] = A[3]&A[4] ⊕ A[0];  B[3] = A[2]&A[3] ⊕ A[4];  B[2] = A[1]&A[2] ⊕ A[3]\nB[1] = B[4]&A[1] ⊕ A[2];  B[0] = B[4]&B[3] ⊕ A[1]\n电路形式共 5 个 AND + 5 个 XOR（ANF 直写要 21 次位运算）", note: "一列的 5 个格子来自 5 个 plane 的同一 (lane, bit) 位置。查表 [0,2,4,23,8,10,14,13,16,18,20,15,28,30,26,17,1,19,5,6,9,27,31,12,25,11,29,22,21,7,3,24]；代数次数 3（逆亦 3）、最大差分概率与最大线性偏差都是 2⁻²、差分与线性分支数都是 2（DDT/LAT 里重量 1→1 的点各只有 5 个）。" },
      { kind: "columnMix", axis: "row", index: 0, sym: "Θ", detailTitle: "Theta[t0..t4] · 分支数 12", detail: "一行 5 条 lane 就是一个 plane（320 位），独立过一个线性置换：先取 5 条 lane 的异或和 E 与旋转异或和 F，再把 E 的逐 lane 旋转与 F 一起打回每条 lane。Theta 的转置等于自身、显式可逆；四条参数约束同时成立时差分与线性分支数都达到 12，而 Keccak 的 θ 只有 4，硬件深度却相同。", cap: "θ · 逐 plane 线性扩散", formula: "E = ⊕ X_i;   F = ⊕ (X_i ⋘ t_i);   Y_i = X_i ⊕ (E ⋙ t_i) ⊕ F\nθ0 = [31,1,4,21,22]   θ1 = [19,12,15,34,13]   θ2 = [28,35,58,9,23]\nθ3 = [55,18,5,27,44]   θ4 = [14,43,53,20,25]\n约束：2t_i ≠ 2t_j、t_i ≠ −t_j、t_i + t_j ≠ 2t_k、t_i + t_j ≠ t_k + t_l  (mod 64)", note: "每 plane 18 次 64 位异或 + 10 次循环移位，全状态 90 XOR + 50 rot；旋转与转置在硬件上都是纯布线。循环移位已并入这一步，所以设计里没有独立的 ρ 层。" },
      { kind: "permute", samples: [[1,0],[2,3],[4,4],[0,1]], cap: "π · 纯 lane 换位", formula: "B[i][j] = A[(i + 2j) mod 5][(3i + 3j) mod 5]", note: "把同一 plane 的 5 条 lane 打散到 5 个不同 plane，且保证同 plane 的任两条 lane 不落进同一 column，后一条正是为了保住 θ 的分支数 12。结构上相当于 Keccak 的 ρ∘π，但旋转部分已被 θ 吸收，所以 π 只剩换位，软硬件都是零成本。", labelAllSources: true, map: function (x, y) { return [(y+3*x)%5,(4*x+4*y)%5]; } }
    ]
  };
  S.llh = {
    construction: {"kind":"sponge","feedforward":true,"tag":"容量侧前馈 · 长度预置","perm":"P · 24 轮","rateBits":"r = 8w（前 8 个字）","capBits":"c = 16w（后 16 个字）","capName":"capacity","outFrom":"rate","outLabel":"摘要 d = 8w","outSub":"额外调用裸 P，随后取前 512 位 rate","ffLabel":"把置换前的 capacity 原样前馈回来","note":"更新式 S⁽ⁱ⁾ = P(S⁽ⁱ⁻¹⁾) ⊕ (M_i ‖ S⁽ⁱ⁻¹⁾_{r:b−1})：次序与常规海绵相反，先置换再异或消息与旧容量。初始状态末 64 位预置消息总长度 L。吸收完所有块后再调用一次 P，取前 r 比特的前 d 比特。","absorbAfter":true,"ivLabel":"H₀ = 0^{b−64} ‖ L","finalPerm":"P · 24 轮","msgLabels":["M₁","Mₜ‖pad"]},
    kind: "lattice",
    rows: 6,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "LLH-512 · 24 个 64 位字排成 6 × 4",
    subtitle: "一格 = 一个 w 位字 Wᵢ（i = 4 × 行 + 列）；每个 bit-slice 上的 24 个比特按同样的 6 × 4 排布，四列各跑一个 6 位 S 盒，六行各跑一次 4 × 4 混合",
    xTicks: ["列 0","列 1","列 2","列 3"],
    yTicks: ["行 0","行 1","行 2","行 3","行 4","行 5"],
    cellNames: ["W0","W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14","W15","W16","W17","W18","W19","W20","W21","W22","W23"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "column", index: 0, width: 6, cap: "S₆ · 二次 6 位置换", formula: "S₆(x) = x ⊕ (x⋙2) ⊕ ((x⋙1) ∧ (x⋙3)) ⊕ 0x1B", parallelNote: "× w 个 bit-slice × 4 列 = 4w 个 6 位 S 盒 / 轮（LLH-512 为 256 个）", note: "文档给出：双射、差分均匀度 16（2⁻²）、分支数 3、代数次数 2，电路深度只有 2，这是整个低时延论证的起点。定理 2-1 保证该式在 n = 3k（k > 1）上是置换。" },
      { kind: "laneMix", target: 0, sources: [9,18,23], rotations: [0,0,0], cap: "D · 错排后每个输出取另外三个输入", formula: "S₂₄ = D ∘ derange ∘ S₆⁴，总深度 4", supportNote: "本行族的四个输入是 (W4, W9, W18, W23)，D 让每个输出等于另外三个输入的异或，故 Y0 = W9 ⊕ W18 ⊕ W23（图中的 Xₙ / Yₙ 即文档的 Wₙ，没有任何旋转）。六个行族：(0; 4,9,18,23) (4; 8,1,22,15) (8; 12,17,6,3) (12; 20,5,10,19) (16; 0,21,14,11) (20; 16,13,2,7)。", detailTitle: "错排 + D：四个 6 位 S 盒被拼成一个 24 位超级 S 盒", note: "错排把四个输入从四个不同的行族取来，D 是对角为 0 其余为 1 的 4 × 4 二元矩阵，分支数 4（4×4 二元矩阵的理论上界）、深度 2、6 个 XOR 门。作者给出 S₂₄ 双射，每个输出比特依赖 12 个输入比特。" },
      { kind: "laneRotate", amountLabel: "σᵢ", sample: [0,0], cap: "ShiftRows · 每个字按自己的 σᵢ 循环左移", formula: "Wᵢ ← ROTL(Wᵢ, σᵢ)，24 个偏移全部非零", note: "本图使用 LLH-512 的 w=64 参数表，24 格逐项列出偏移；整数左旋 ROTL64，bit 0 为最低位。", dir: "left", amounts: function (c, r) { return [[2,25,20,51],[15,40,37,6],[36,63,62,33],[1,30,31,4],[38,5,8,47],[19,52,57,34]][r][c]; } },
      { kind: "const", axis: "cells", cells: [[3,5]], cap: "轮常数只进 W₂₃", formula: "W₂₃ ← W₂₃ ⊕ RCᵢ\nLLH-512：RC₀ = 0xB7E151628AED2A6A", note: "w=64 取 e−2 的连续 64 位切片；不能将 w=32 的首常数混用于 LLH-512。" }
    ]
  };
  S.mastercube = {
    construction: {"kind":"sponge","feedforward":false,"tag":"变换型海绵（T-Sponge）· pad10*1","perm":"Cube-f · v2.1\n1536 位 · 9+9 轮","rateBits":"r = 960 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"吸收完最后一块后直接从 rate 读出，无额外终止化","note":"Cube-f 的两条分支从同一输入独立开始，结果整状态异或。v2.1 修正逆轮与 pad10*1；仅余一位填充空间时需追加一块。模式参数不变；作者声明全部 KAT 已更新。"},
    kind: "lattice",
    rows: 12,
    cols: 8,
    xLabel: "x",
    yLabel: "行",
    title: "Cube-p · 12 行 × 8 列 16 位 cell",
    subtitle: "96 个 16 位 cell = 1536 位；每行 128 位。v0…v5 与 v6…v11 是两个 slice，同列相隔 6 行组成一条 32 位 lane，共 48 对。先看完整正向轮，再看 ZIP 双分支。",
    xTicks: ["x0","x1","x2","x3","x4","x5","x6","x7"],
    yTicks: ["v0","v1","v2","v3","v4","v5","v6","v7","v8","v9","v10","v11"],
    cellNames: ["v0.0","v0.1","v0.2","v0.3","v0.4","v0.5","v0.6","v0.7","v1.0","v1.1","v1.2","v1.3","v1.4","v1.5","v1.6","v1.7","v2.0","v2.1","v2.2","v2.3","v2.4","v2.5","v2.6","v2.7","v3.0","v3.1","v3.2","v3.3","v3.4","v3.5","v3.6","v3.7","v4.0","v4.1","v4.2","v4.3","v4.4","v4.5","v4.6","v4.7","v5.0","v5.1","v5.2","v5.3","v5.4","v5.5","v5.6","v5.7","v6.0","v6.1","v6.2","v6.3","v6.4","v6.5","v6.6","v6.7","v7.0","v7.1","v7.2","v7.3","v7.4","v7.5","v7.6","v7.7","v8.0","v8.1","v8.2","v8.3","v8.4","v8.5","v8.6","v8.7","v9.0","v9.1","v9.2","v9.3","v9.4","v9.5","v9.6","v9.7","v10.0","v10.1","v10.2","v10.3","v10.4","v10.5","v10.6","v10.7","v11.0","v11.1","v11.2","v11.3","v11.4","v11.5","v11.6","v11.7"],
    unitName: "16 位 cell",
    ops: [
      { kind: "columnMix", axis: "column", index: 0, sym: "C", cap: "CrossMixs（第一次）", detailTitle: "sheet 内扩散 · 6×6 循环对合矩阵", detail: "一列 12 个 cell 就是一个 sheet。12 个 cell 分奇偶两组各 6 个，各自左乘同一个 6×6 循环且对合的二元矩阵 circ(1,1,0,0,1,0)，每个输出是 3 个输入的异或；8 个 sheet 并行，整层 192 次 16 位异或。", formula: "circ(1,1,0,0,1,0)，每输出 = 3 个输入异或", note: "矩阵循环且对合，所以逆分支的 CrossMixs 就是它自己，ZIP 的逆通路在这一层零额外面积。紧随其后的 SwapRows 见下一步（一轮里它出现两次）。", inCap: "12 个 cell 分奇偶两组各 6 个", depNote: "各自左乘 6×6 的 circ(1,1,0,0,1,0)：每个输出 = 3 个输入异或，奇偶两组之间不混", groupBy: "parity" },
      { kind: "permute", wholeRows: true, samples: [[0,6],[0,7],[0,8],[0,10]], cap: "SwapRows（第一次）", formula: "v6 ↔ v7；v8 ↔ v9；v10 ↔ v11", note: "交换的是整个 128 位行；两次 SwapRows 均在流程中显示。", map: function (x, y) { return [x,y<6?y:(y%2===0?y+1:y-1)]; } },
      { kind: "laneFunc", sample: [0,0], sym: "F", cap: "MAndRX", innerTitle: "48 对 cell 并行；示例 (v0.0, v6.0)", formula: "F(x) = (ROTR16(x,α) ∧ ROTR16(x,β)) ⊕ ROTR16(x,γ)", stages: ["R⊕=F(0,1,8)","L⊕=F(14,5,0)","R⊕=F(9,12,8)","L⊕=F(14,5,0)","R⊕=F(0,1,8)","L⊕=F(8,9,0)"], note: "两个高亮格共同参加非线性运算。六次更新交替写入 L/R，每次读取此前更新后的值。", inCap: "48 对 lane；本例为同列相隔 6 行的两个 cell", depNote: "两个 cell 共同更新，共 48 × 6 次子轮", pairCells: [[0,0],[0,6]] },
      { kind: "columnMix", axis: "column", index: 0, sym: "C", cap: "CrossMixs（第二次）", detailTitle: "sheet 内扩散 · 6×6 循环对合矩阵", detail: "一列 12 个 cell 就是一个 sheet。12 个 cell 分奇偶两组各 6 个，各自左乘同一个 6×6 循环且对合的二元矩阵 circ(1,1,0,0,1,0)，每个输出是 3 个输入的异或；8 个 sheet 并行，整层 192 次 16 位异或。", formula: "circ(1,1,0,0,1,0)，每输出 = 3 个输入异或", note: "矩阵循环且对合，所以逆分支的 CrossMixs 就是它自己，ZIP 的逆通路在这一层零额外面积。紧随其后的 SwapRows 见下一步（一轮里它出现两次）。", inCap: "12 个 cell 分奇偶两组各 6 个", depNote: "各自左乘 6×6 的 circ(1,1,0,0,1,0)：每个输出 = 3 个输入异或，奇偶两组之间不混", groupBy: "parity" },
      { kind: "permute", wholeRows: true, samples: [[0,6],[0,7],[0,8],[0,10]], cap: "SwapRows（第二次）", formula: "v6 ↔ v7；v8 ↔ v9；v10 ↔ v11", note: "交换的是整个 128 位行；两次 SwapRows 均在流程中显示。", map: function (x, y) { return [x,y<6?y:(y%2===0?y+1:y-1)]; } },
      { kind: "columnMix", axis: "column", index: 0, sym: "M", cap: "MixColumns", detailTitle: "sheet 内 3×3", detail: "每列分成四组三元组：(v0,v2,v4)、(v1,v3,v5) 用 M¹；(v6,v8,v10)、(v7,v9,v11) 用 M²。不是两个六维矩阵。v2.1 逆轮通过交换两个 slice 实现 C⁻¹ = J C J。", formula: "M¹ = [[0,1,1],[1,0,1],[1,1,1]]，M² = [[1,0,1],[0,1,1],[1,1,1]]", note: "与 CrossMixs 同属 sheet 方向，矩阵更小；M¹M² = I，v2.1 勘误说明逆层可交换两个 slice 后复用正向 MixColumns。", inCap: "12 个 cell 分奇偶两组", depNote: "四个三元组分别混合；v2.1 的逆层为 J C J", groupBy: "groups", groups: [[0,2,4],[1,3,5],[6,8,10],[7,9,11]] },
      { kind: "permute", samples: [[0,1],[0,5],[0,7],[0,11]], labelAllSources: true, cap: "ShiftRows · 两个 slice 方向相反", formula: "v0…v5 左移 0…5 个 cell\nv6…v11 右移 0…5 个 cell", note: "一格是 16 位；格内显示原输入 cell，两个 slice 方向相反。", map: function (x, y) { return [(x+(y<6?-(y%6):(y%6))+8)%8,y]; } },
      { kind: "columnMix", axis: "row", index: 0, sym: "R", cap: "MixRows", detailTitle: "slice 内行方向 · 4×4 循环矩阵", detail: "一行 8 个 cell 分奇偶两组各 4 个，各自左乘 4×4 循环矩阵 circ(1,1,0,1)，分支数 4，为二元 4×4 循环矩阵的最优值。12 行并行，整层 192 次异或。", formula: "M = circ(1,1,0,1)，每输出 = 3 个输入异或，分支数 4", note: "只用 32 位整数倍的循环移位构造，好让立即数编码的 _mm256_shuffle_epi32 直接实现、不必额外装载掩码。它与 ShiftRows 构成 slice 方向的扩散，与 CrossMixs / MixColumns 的 sheet 方向正交；整个线性层合起来比特级分支数 11。", inCap: "一行 8 个 cell 分奇偶两组各 4 个", depNote: "各自左乘 4×4 的 circ(1,1,0,1)：每个输出 = 3 个输入异或，分支数 4", groupBy: "parity" },
      { kind: "const", axis: "cells", cells: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0]], cap: "AddConstant", selCap: "96 个 cell 里只有 A⁰ 第一行的 8 个参与", formula: "RC[i] = (0x7344,0x0370,0x8A2E,0x1319,0x08D3,0x85A3,0x6A88,0x243F) ⊕ i", note: "按 v2.1 勘误注明 little-endian 顺序；异或进 v0 的 8 个 16 位 cell。正向分支用 RC[0…8]，逆向分支用 RC[17…9]。" },
      { kind: "wire", branches: [{"label":"正向 9 轮","constant":"RC[0] → RC[8]","symbol":"P⁺"},{"label":"逆向 9 轮 · v2.1","constant":"RC[17] → RC[9]","symbol":"P⁻"}], cap: "Cube-f · ZIP", formula: "Cube-f(A) = P⁺(A) ⊕ P⁻(A)", summary: ["同一个 A 分别送入两条分支；两份完整 1536 位结果在末端异或。","修订逆轮使用 MAndRX⁻¹、MixColumns⁻¹ = J C J，并倒序使用参数与轮常数。","图示作者 v2.1 勘误所规定的构造；作者说明修正不影响安全证明与设计原理。"] }
    ]
  };
  S.megascon = {
    construction: {"kind":"sponge","feedforward":false,"tag":"标准海绵 · M‖1‖0*","perm":"Megascon-p\n2048 位 · 15 轮","rateBits":"r = 1024 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"一次截断，无多块挤出","note":"修订版在初态末 4 位加入实例域编码。768/1024 采用容量前馈；修订文档将末块标记明确为 capacity 首位的 1。本图主实例为 512、15 轮。","ivLabel":"IV = 0²⁰⁴⁴‖0011"},
    kind: "lattice",
    rows: 8,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "Megascon 置换 · 8 行 × 4 个 64 位字",
    subtitle: "一格 = 一个 64 位字 x_{i,j}；一行 4 格 = 256 位 = 一个 YMM 寄存器；8 行合计 2048 位 = 8 个 ymm",
    bands: [{"from":[0,0],"to":[3,3],"label":"rate · 1024 bit","color":"#d65f4f"},{"from":[0,4],"to":[3,7],"label":"capacity · 1024 bit","color":"#8a8f98"}],
    xTicks: ["j = 0","j = 1","j = 2","j = 3"],
    yTicks: ["x₀","x₁","x₂","x₃","x₄","x₅","x₆","x₇"],
    cellNames: ["x0,0","x0,1","x0,2","x0,3","x1,0","x1,1","x1,2","x1,3","x2,0","x2,1","x2,2","x2,3","x3,0","x3,1","x3,2","x3,3","x4,0","x4,1","x4,2","x4,3","x5,0","x5,1","x5,2","x5,3","x6,0","x6,1","x6,2","x6,3","x7,0","x7,1","x7,2","x7,3"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "column", index: 0, width: 8, parallelNote: "× 64 个 z 切片 × 4 个字列 = 256 个 S 盒 / 轮", cap: "p_S · χχ 八比特 S 盒", formula: "v0 = u0 ⊕ (¬u1 ∧ u2)　…　v3 = ¬u1 ⊕ (¬u4 ∧ ¬u5)\n每盒 8 个 AND，电路深度 2", note: "8 个输入比特取自 8 行同一个字列、同一位下标；整层按 256 位行向量计是 8 ANDN + 8 XOR + 2 NOT。", inCap: "高亮字的同一位组成 8 比特输入" },
      { kind: "permute", samples: [[0,0],[0,1],[0,6],[0,7]], cap: "p_π · 行置换", formula: "π = (1, 7, 5, 2, 4, 6, 0, 3)", note: "整行搬移、列下标不变，纯布线零门代价；文档给出复合 g(a) = π(s(a)) 为 0→1→2→4→7→3→5→6→0 的单圈。", wholeRows: true, inCap: "高亮 4 条示例整行；一行包含 4 个字", depNote: "输出格标出原字名；列 j 保持不变", map: function (x, y) { return [x,[1,7,5,2,4,6,0,3][y]]; } },
      { kind: "columnMix", axis: "row", index: 0, sym: "L", detailTitle: "每行 4 个 64 位字的 4 旋转 4 异或", detail: "(a,b,c,d) 逐行为 (1,3,14,36)、(2,5,23,60)、(4,15,17,24)、(7,9,12,40)、(26,46,13,37)、(49,6,50,25)、(55,19,56,57)、(58,47,61,28)。", cap: "p_L · 行内扩散", formula: "y_{i,j} = x_{i,j} ⊕ (x_{i,j+1}⋘a_i) ⊕ (x_{i,j+2}⋘b_i)\n　　　　 ⊕ (x_{i,j+3}⋘c_i) ⊕ (x_{i,j}⋘d_i)", note: "8 行各自独立、旋转量逐行不同，字下标模 4；非 MDS 结构，文档未给出分支数。" },
      { kind: "const", at: [0,0], cap: "p_C · 轮常数只进 x_{0,0}", formula: "x_{0,0} ← x_{0,0} ⊕ RC[r]\n32 个字里只有 1 个", note: "x₀,₀ 整个 64 位字参与 XOR，常数的 1 位分布随轮次变化；例如第 0 轮 RC = 0xe220a8397b1dcdaf。其余 31 个字原样通过。", injTitle: "一个 64 位轮常数字，而非全 1 掩码" }
    ]
  };
  S.mofang = {
    construction: {"kind":"chain","tag":"Davies–Meyer + MDP（长摘要用 MDPH）","box":"压缩函数 CF","boxSub1":"MoFang-BC · 576 位分组 / 16 轮","boxSub2":"链值当明文，1152 位消息整块进密钥口","chainBits":"链值 576 bit（长摘要 2 × 576 bit）","finalBox":"摘要截断","finalSub1":"末块压缩已完成","finalSub2":"取请求的摘要长度","note":"Pad10* 后迭代压缩；最后一块前先对链值应用 π（图中小盒），再执行最后的 Davies–Meyer 压缩，最后截断。256/512 版是一条 576 位链，768/1024 使用长摘要模式。此图采用 9 月修订 KE；公开论坛报告了原版消息扩展抵消导致的固定 IV 全轮碰撞，作者已确认并发布修订。","dmFeedback":true,"dmLabel":"块内 Davies–Meyer 前馈：CF(h, M) = E_M(h) ⊕ h，在同一次压缩调用内部完成","msgLabels":["M₀ → 密钥口","M末 → 密钥口"],"preLast":true},
    kind: "lattice",
    rows: 3,
    cols: 3,
    xLabel: "x",
    yLabel: "y",
    title: "MoFang-BC · 3 × 3 的 64 位字矩阵",
    subtitle: "一格 = 一个 64 位字 I[x][y]；3 行 × 3 列 = 9 个字 = 576 bit，一行的 3 个字在每个 z 切片上凑成一个 3 位 S 盒",
    bands: [{"from":[0,0],"to":[2,0],"label":"一行 = 一个 3 位 S 盒的三个输入字","color":"#c0562e"}],
    cellNames: ["I00","I10","I20","I01","I11","I21","I02","I12","I22"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "row", index: 1, width: 3, cap: "SubBytes · 3 位 S 盒（取自 SEA）", formula: "S = [0, 5, 6, 7, 4, 3, 1, 2]\ny₀ = x₀ ⊕ x₁x₂,  y₁ = x₁ ⊕ x₀x₂ ⊕ x₁x₂\ny₂ = x₀ ⊕ x₁ ⊕ x₀x₁ ⊕ x₂　（x₀ = LSB）", parallelNote: "× 64 个 z 切片 × 3 行 = 192 个 3 位 S 盒 / 轮", note: "差分均匀度 2、最大 |LAT| 4，为 3 位双射可达的最优值；代数次数 2。192 个 S 盒分布在 3 行与 64 个 z 切片上，互不相交。" },
      { kind: "columnMix", axis: "all", sym: "M", cap: "MixColumn · GF(2³) 的 3 × 3 MDS", formula: "tmp = S₀ ⊕ S₁ ⊕ S₂;  tmp = α · tmp\nSᵢ ← Sᵢ ⊕ tmp\nM = [[3,2,2],[2,3,2],[2,2,3]]", detailTitle: "每轮 64 个 MixColumn（576/9），一个 z 切片一个", detail: "3 个 3 位符号沿 y 方向进矩阵，分支数 4；α 是 3 位 LFSR 乘法，可按 64 位字以移位与异或实现，整层只需求和、一次 α 乘与回写。", note: "矩阵取自 Duval–Leurent（ToSC 2018）的轻量电路构造：没有大矩阵乘，也不需要查表。", inCap: "一个 z 切片上的 3 个符号 = 全部 9 个字", depNote: "α 是 GF(2³) 的 LFSR 乘法，符号的 3 个比特落在 3 个不同的列，这一层是跨列混合的" },
      { kind: "laneRotate", amountLabel: "ρⁱ_{x,y}", sample: [1,1], cap: "ShiftRow · 逐格不同的循环右移", formula: "D[x, y, z] = RotR(C[x, y, z], ρⁱ_{x,y})\n偶轮按行 (0,3,6) / (9,12,15) / (18,21,24)\n奇轮按行 (0,24,48) / (8,32,56) / (16,40,7)", note: "图中显示偶轮的逐格 RotR 参数；奇轮表为 (0,24,48)/(8,32,56)/(16,40,7)。旋转宽度 64 位，字位置不变。", amounts: function (c, r) { return [[0,3,6],[9,12,15],[18,21,24]][r][c]; }, dir: "right" },
      { kind: "const", axis: "all", cap: "AddRoundKey · 由消息块与链值导出的轮密钥", formula: "I ← I ⊕ (K⁰ᵢ ⊕ K¹ᵢ [⊕ K²ᵢ])\n1 次白化密钥 + 16 次轮密钥，每轮 18 次 64 位异或", selCap: "9 个字全部参与，每个字的 64 位都被改写", note: "轮密钥由消息块与链值组成的密钥状态生成，所有 64 位均可参与异或；消息可控不等于可自由选择固定 IV 的整个链值。", injSym: "⊕ K", injShort: "K", injTitle: "这一步注入的是轮密钥，不是轮常数" },
      { kind: "wire", sym: "KE", cap: "KE₁ · 第一消息半块", formula: "B[0] = SBox(A[0]); B[1]=A[1]; B[2]=A[2]\nC[x,y] = B[y,(2x+y) mod 3]; D=RotR(C,ρ₁)", leftCap: "576 位密钥半块 A", rightCap: "格内：C[x,y] 取自 B 的位置，随后按 ρ₁ 右旋", detailTitle: "修订密钥扩展 · 与数据状态分开", summary: ["该图格子表示 576 位密钥半块，KE 在每轮状态运算前执行。密钥编排不包含 MDS。","2026-09-28 修订仍保留第一半块的原路径；第二半块改用 A[1] 作为 SBox 输入。长摘要的 Algorithm 4 先转置链值支路，再分别处理两份消息半块。"], assignments: ["A = M₁（576 位消息半块）","B[0] = SBox(A[0])","B[1] = A[1]; B[2] = A[2]","C[x,y] = B[y,(2x+y) mod 3]","D[x,y] = RotR(C[x,y],ρ₁[x,y])","K = D"], outMarks: {"I00":["←B[0,0]"],"I01":["←B[1,1]"],"I02":["←B[2,2]"],"I10":["←B[0,2]"],"I11":["←B[1,0]"],"I12":["←B[2,1]"],"I20":["←B[0,1]"],"I21":["←B[1,2]"],"I22":["←B[2,0]"]} },
      { kind: "wire", sym: "KE", cap: "KE₂ · 修订第二消息半块", formula: "B[0] = SBox(A[1]); B[1]=A[1]; B[2]=A[2]\nC[x,y] = B[(x+2y) mod 3,x]; D=RotR(C,ρ₂)", leftCap: "576 位密钥半块 A", rightCap: "格内：C[x,y] 取自 B 的位置，随后按 ρ₂ 右旋", detailTitle: "修订密钥扩展 · 与数据状态分开", summary: ["按勘误原文，第二行是 SBox 的输入，而结果赋给 B[0]；B[1]、B[2] 仍复制 A[1]、A[2]。","长摘要 Algorithm 4 同样将第三密钥支路的 B[0] 改为 SBox(A[1])；并把第 23 行改为 C[x,y]←B[y,2x+y]。作者称已同步更新实现并重新生成 KAT。"], assignments: ["A = M₂（第二消息半块）","B[0] = SBox(A[1])","B[1] = A[1]; B[2] = A[2]","C[x,y] = B[(x+2y) mod 3,x]","D = RotR(C,ρ₂); D ⊕= RC[i]","K ⊕= D"], outMarks: {"I00":["←B[0,0]"],"I01":["←B[2,0]"],"I02":["←B[1,0]"],"I10":["←B[1,1]"],"I11":["←B[0,1]"],"I12":["←B[2,1]"],"I20":["←B[2,2]"],"I21":["←B[1,2]"],"I22":["←B[0,2]"]} }
    ]
  };
  S.mozi = {
    construction: {"kind":"sponge","feedforward":false,"tag":"标准海绵 · M‖1‖0*","perm":"Mozi-p\n2048 位 · 20 轮","rateBits":"r = 1024 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"一次截断，无多块挤出","note":"图示 2026-09-28 修订版 Mozi-512。各实例在 capacity 末 4 位加入不同域编码；768/1024 保留容量前馈，末块标记统一落在状态最后一位，摘要取末 h 位。修订改变摘要，作者已重新生成 KAT。","ivLabel":"IV = 0²⁰⁴⁴‖0011"},
    kind: "lattice",
    rows: 4,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "Mozi 置换 · 4 × 4 个 128 位 lane",
    subtitle: "一格 = 一个 128 位 lane I[x][y]（序号 4x + y）；固定 z 时一行 4 格 = 1 个 nibble；16 格 = 2048 位 = 128 个 column、512 个 nibble",
    bands: [{"from":[0,0],"to":[1,3],"label":"rate · 1024 bit","color":"#5aa86b"},{"from":[2,0],"to":[3,3],"label":"capacity · 1024 bit","color":"#8a8f98"}],
    xTicks: ["x = 0","x = 1","x = 2","x = 3"],
    yTicks: ["y = 0","y = 1","y = 2","y = 3"],
    cellNames: ["L0","L4","L8","L12","L1","L5","L9","L13","L2","L6","L10","L14","L3","L7","L11","L15"],
    unitName: "lane",
    ops: [
      { kind: "sbox", axis: "row", index: 0, width: 4, parallelNote: "× 128 个 z 切片 × 4 行 = 512 个 S 盒 / 轮", cap: "S-box · 4 比特", formula: "S = [0,8,6,13,5,15,7,12,4,14,2,3,9,1,11,10]\n3 AND + 1 OR + 4 XOR", note: "一个 nibble = 固定 (y,z) 时沿 x 的 4 个比特，即图中同一行 4 格在同一位平面上的取值。" },
      { kind: "columnMix", axis: "all", sym: "M", detailTitle: "GF(2⁴) 上的 4×4 MDS，分支数 5", detail: "固定 z 时把沿 y 的 4 个 nibble 送进矩阵；由于每个 nibble 横跨 x，一个 z 切片上的 16 格全部参与，128 个 z 切片并行。", cap: "MixColumn · MDS", formula: "α(x₀,x₁,x₂,x₃) = (x₃,x₀⊕x₃,x₁,x₂)\n128 个 z 切片并行；6 次 MUL", note: "9 月勘误已将显示矩阵转置，现与 MUL 一致。一次 MDS 涉及固定 z 的 4 个 nibble；每个 nibble 横跨 x。", inCap: "固定 z：4 个 nibble，每个横跨 4 个 x-lane", depNote: "同一个 z 切片的 16 个比特共同参加 MDS" },
      { kind: "laneRotate", amounts: function (c, r) { return [0,14,20,22][r % 4]; }, sample: [0,1], cap: "ShiftRow · lane 内循环右移", formula: "128 位整数循环右移，ρ 依赖轮号 i mod 4 与 y\ni ≡ 0：ρ = (0,14,20,22)", note: "图示 i ≡ 0 的一组；另三组按轮号 mod 4 轮换，y = 0 恒不旋转。", unitBits: 128 },
      { kind: "const", at: [3,3], cap: "AddConstant · 只动 1 字节", formula: "D[3,3][7:0] ⊕= RC[i]\n覆盖 8 / 2048 = 0.39%", bits: [0,1,2,3,4,5,6,7], note: "高亮表示 RC 可能作用的最低 8 位，不表示每个常数这 8 位都为 1。", unitBits: 128, bitIndexOrder: "lsb-first" }
    ]
  };
  S.neulaser = {
    construction: {"kind":"chain","tag":"PRNG 链式 · MD-strengthening","box":"PRNG_v(V_i, M_i)","boxSub1":"非末块：32 空转 + 6 输出轮","boxSub2":"µ 路耦合 NLSR，每轮 2µ 次字函数 F","chainBits":"链值 v = 576 bit","finalBox":"末块：PRNG_{v+n}","finalSub1":"末块：32 空转 + 12 输出轮","finalSub2":"生成 1088 位，取链值段后 512 位","note":"Neulaser-512：V⊕C_i（576 位）与 M_i（960 位）按大端字填入 1536 位状态。每次先空转 32 轮；非末块生成 v=576 位（6 输出轮），末块生成 v+n=1088 位（12 输出轮），取末 512 位摘要。每输出轮先更新状态再产生 32µ 位输出。填充 M‖1‖0*‖len64(M)。公开论坛报告了固定 IV 全轮碰撞，截至 2026-09-30 未见作者修订。","msgLabels":["M₀ · 960 位；C₀","M₁ · 960 位；C₁"]},
    kind: "lattice",
    rows: 6,
    cols: 8,
    xLabel: "格",
    yLabel: "",
    title: "Neulaser-512 · 3 模块 × 16 级（展开）",
    subtitle: "每模块分为相邻两行：上行 s0…7，下行 s8…15；一格 32 位字，48 格共 1536 位。输入消息包含未约减的 32 位字，后续部分路径做 mod p（p=2³²−5）。",
    yTicks: ["M0低级","M0高级","M1低级","M1高级","M2低级","M2高级"],
    cellNames: ["0:0","0:1","0:2","0:3","0:4","0:5","0:6","0:7","0:8","0:9","0:10","0:11","0:12","0:13","0:14","0:15","1:0","1:1","1:2","1:3","1:4","1:5","1:6","1:7","1:8","1:9","1:10","1:11","1:12","1:13","1:14","1:15","2:0","2:1","2:2","2:3","2:4","2:5","2:6","2:7","2:8","2:9","2:10","2:11","2:12","2:13","2:14","2:15"],
    unitName: "级",
    ops: [
      { kind: "laneMix", target: 15, sources: [0,4,9,13,15], cap: "ℓ_lin · 模块内素域线性核", formula: "ℓ = 8193·s₀ + (2²⁴+1)·s₄ + 2²²·s₉\n　　+ 9·s₁₃ + 2¹⁹·s₁₅  (mod p)", exprLabel: "ℓ = 8193·s₀ + (2²⁴+1)·s₄ + 2²²·s₉ + 9·s₁₃ + 2¹⁹·s₁₅ (mod p)", inCap: "16 级里只抽 s₀ s₄ s₉ s₁₃ s₁₅ 这 5 级", depNote: "三个模块同构、互不来往，这一层没有跨模块信息流", detailTitle: "为什么系数是这五个数", supportNote: "五个系数 8193 = 2¹³+1、2²⁴+1、2²²、9 = 2³+1、2¹⁹ 全是 2 的幂或 2 的幂加一，每一项都能用移位加法实现。", note: "特征多项式 x¹⁶ − 2¹⁹x¹⁵ − 9x¹³ − 2²²x⁹ − (2²⁴+1)x⁴ − 8193 在 F_p 上本原，线性周期 p¹⁶ − 1。注意这是模 p 的线性组合，不是异或。", sourceLabels: {"0":"M0:s0","1":"M0:s1","2":"M0:s2","3":"M0:s3","4":"M0:s4","5":"M0:s5","6":"M0:s6","7":"M0:s7","8":"M0:s8","9":"M0:s9","10":"M0:s10","11":"M0:s11","12":"M0:s12","13":"M0:s13","14":"M0:s14","15":"M0:s15","16":"M1:s0","17":"M1:s1","18":"M1:s2","19":"M1:s3","20":"M1:s4","21":"M1:s5","22":"M1:s6","23":"M1:s7","24":"M1:s8","25":"M1:s9","26":"M1:s10","27":"M1:s11","28":"M1:s12","29":"M1:s13","30":"M1:s14","31":"M1:s15","32":"M2:s0","33":"M2:s1","34":"M2:s2","35":"M2:s3","36":"M2:s4","37":"M2:s5","38":"M2:s6","39":"M2:s7","40":"M2:s8","41":"M2:s9","42":"M2:s10","43":"M2:s11","44":"M2:s12","45":"M2:s13","46":"M2:s14","47":"M2:s15"}, leftTitle: "本步输入 · 本轮旧状态", rightTitle: "本步输出 · 临时量，尚未写回", outputLabel: "ℓ0", sym: "Σₚ" },
      { kind: "laneMix", target: 15, sources: [0,5,10,15], cap: "F · 非线性字函数（每模块一次）", formula: "F = ((S(L1(U)) ⊕ rotl32(R1, 8)) + S(L2(V))) mod 2³²\nΦ = redp(ℓ_lin + F(s₁₅, s₁₀, s₅, s₀))", exprLabel: "Φ = redp(ℓ_lin + F(s₁₅, s₁₀, s₅, s₀))", inCap: "输入是本模块的 s₁₅ s₁₀ s₅ s₀ 四个字", depNote: "输出只有一个字；这一层也没有跨模块流动", detailTitle: "F 内部：ZUC 式字滤波", supportNote: "F 的操作数次序为 s15,s10,s5,s0；先用 mod 2³² 加、异或、64 位拼接旋转、L1/L2 与字节 S 盒，最后与 ℓ_lin 做 mod p 合成 Φ。", note: "输入是本模块的 s₁₅、s₁₀、s₅、s₀ 四个 32 位字，输出只有一个字。F 包含 8 次字节 S 盒查表；S 盒是 GF(2⁸) 求逆 + 仿射，域多项式 X⁸+X⁵+X³+X²+1、仿射常数 0xa7，与 AES 和 SM4 都不同。这一层没有跨模块流动，跨模块只发生在下一步的 Γ。", sourceLabels: {"0":"M0:s0","1":"M0:s1","2":"M0:s2","3":"M0:s3","4":"M0:s4","5":"M0:s5","6":"M0:s6","7":"M0:s7","8":"M0:s8","9":"M0:s9","10":"M0:s10","11":"M0:s11","12":"M0:s12","13":"M0:s13","14":"M0:s14","15":"M0:s15","16":"M1:s0","17":"M1:s1","18":"M1:s2","19":"M1:s3","20":"M1:s4","21":"M1:s5","22":"M1:s6","23":"M1:s7","24":"M1:s8","25":"M1:s9","26":"M1:s10","27":"M1:s11","28":"M1:s12","29":"M1:s13","30":"M1:s14","31":"M1:s15","32":"M2:s0","33":"M2:s1","34":"M2:s2","35":"M2:s3","36":"M2:s4","37":"M2:s5","38":"M2:s6","39":"M2:s7","40":"M2:s8","41":"M2:s9","42":"M2:s10","43":"M2:s11","44":"M2:s12","45":"M2:s13","46":"M2:s14","47":"M2:s15"}, leftTitle: "本步输入 · 本轮旧状态", rightTitle: "本步输出 · 临时量，尚未写回", outputLabel: "Φ0", sym: "F" },
      { kind: "laneMix", target: 15, sources: [14,25,38,1,17], cap: "Γ · 跨模块全局混淆", formula: "r=0,i=0,µ=3：X=A0⊕ROTL(B1,7)，Y=B1⊞C2\nZ=C2⊕ROTL(D0,11)，W=D1⊞A0\nΓ0=F(X,Y,Z,W)⊕κ0", exprLabel: "r=0,i=0,µ=3：X=A0⊕ROTL(B1,7)，Y=B1⊞C2\nZ=C2⊕ROTL(D0,11)，W=D1⊞A0\nΓ0=F(X,Y,Z,W)⊕κ0", inCap: "五个不同源字先合成四个 F 操作数（r=0,i=0,µ=3）", depNote: "这是整个原语里唯一的跨模块信息通道", detailTitle: "接线为什么要随轮号转", supportNote: "Ai=s14、Bi=s9、Ci=s6、Di=s1；四个 F 操作数先各合并两个抽头，这里共有五个不同的源字。示例只固定 r=0,i=0，接线随 r 变化。", note: "Γ 与模块内反馈复用同一个 F，因此每轮全状态共 2µ = 6/8/10 次 F 调用；具体偏移表按 µ = 3/4/5 各一行，见文档。", sourceLabels: {"0":"M0:s0","1":"M0:s1","2":"M0:s2","3":"M0:s3","4":"M0:s4","5":"M0:s5","6":"M0:s6","7":"M0:s7","8":"M0:s8","9":"M0:s9","10":"M0:s10","11":"M0:s11","12":"M0:s12","13":"M0:s13","14":"M0:s14","15":"M0:s15","16":"M1:s0","17":"M1:s1","18":"M1:s2","19":"M1:s3","20":"M1:s4","21":"M1:s5","22":"M1:s6","23":"M1:s7","24":"M1:s8","25":"M1:s9","26":"M1:s10","27":"M1:s11","28":"M1:s12","29":"M1:s13","30":"M1:s14","31":"M1:s15","32":"M2:s0","33":"M2:s1","34":"M2:s2","35":"M2:s3","36":"M2:s4","37":"M2:s5","38":"M2:s6","39":"M2:s7","40":"M2:s8","41":"M2:s9","42":"M2:s10","43":"M2:s11","44":"M2:s12","45":"M2:s13","46":"M2:s14","47":"M2:s15"}, leftTitle: "本步输入 · 本轮旧状态", rightTitle: "本步输出 · 临时量，尚未写回", outputLabel: "Γ0", sym: "F" },
      { kind: "wire", sym: "UPD", cap: "同时生成新状态 · 仅四个输出级覆盖", formula: "t[j]=s[j+1]，j≠3,7,11,15\n新末级 t15=redₚ(Φ0⊕Γ0)，不是循环搬回旧 s0", assignments: ["t[j] = s[j+1]（其余 12 级）","t3 = redₚ(s4 ⊕ ROTL(Γ1,5))","t7 = redₚ(s8 ⊕ ROTL(Γ2,13))","t11 = redₚ(s12 ⊕ ROTL(Γ1,21))","t15 = redₚ(Φ0 ⊕ Γ0)","所有模块计算完毕，再 S = T"], detailTitle: "µ=3、模块 0 的真实输出依赖", summary: ["(e1,e2,e3)=(1,2,1)；µ=4/5 则为 (1,2,3)。这里所有 Γ、Φ 先从同一个旧状态生成，最终同时写回。","这不是循环移位：旧 s0 仅经反馈计算影响末级，不能把它直接接到 t15。","s8、s12 不进入其他本轮抽头；redₚ 在 0…4 与 p…p+4 上为二对一。公开论坛报告的全轮碰撞利用了这一状态合并机制。"], leftCap: "标注：直接进入末级反馈的抽头", rightCap: "标注：前移来源或写入该级的赋值编号", outMarks: {"0:0":["←s1"],"0:1":["←s2"],"0:2":["←s3"],"0:3":["02 反馈"],"0:4":["←s5"],"0:5":["←s6"],"0:6":["←s7"],"0:7":["03 反馈"],"0:8":["←s9"],"0:9":["←s10"],"0:10":["←s11"],"0:11":["04 反馈"],"0:12":["←s13"],"0:13":["←s14"],"0:14":["←s15"],"0:15":["05 反馈"],"1:0":["←s1"],"1:1":["←s2"],"1:2":["←s3"],"1:3":["02 反馈"],"1:4":["←s5"],"1:5":["←s6"],"1:6":["←s7"],"1:7":["03 反馈"],"1:8":["←s9"],"1:9":["←s10"],"1:10":["←s11"],"1:11":["04 反馈"],"1:12":["←s13"],"1:13":["←s14"],"1:14":["←s15"],"1:15":["05 反馈"],"2:0":["←s1"],"2:1":["←s2"],"2:2":["←s3"],"2:3":["02 反馈"],"2:4":["←s5"],"2:5":["←s6"],"2:6":["←s7"],"2:7":["03 反馈"],"2:8":["←s9"],"2:9":["←s10"],"2:10":["←s11"],"2:11":["04 反馈"],"2:12":["←s13"],"2:13":["←s14"],"2:14":["←s15"],"2:15":["05 反馈"]}, inMarks: {"0:0":["→Φ"],"0:4":["→t3"],"0:8":["→t7"],"0:12":["→t11"],"1:0":["→Φ"],"1:4":["→t3"],"1:8":["→t7"],"1:12":["→t11"],"2:0":["→Φ"],"2:4":["→t3"],"2:8":["→t7"],"2:12":["→t11"]} }
    ]
  };
  S.pavelor = {
    construction: {"kind":"sponge","feedforward":false,"tag":"标准海绵 · pad 10*1","perm":"Paff\n2560 位 · 24 轮","rateBits":"r = 1536 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"直接从 rate 读取，不做终止化置换","note":"标准海绵采用 pad10*1 与实例 IV。512/768 摘要长度不超过 rate，直接读取；1024 实例 rate 为 512 位，需额外一次置换才能读满 1024 位。实例 IV 位于 rate 内，与第一个消息块异或。","ivLabel":"IV_h = ⟨r⟩₁₂₈‖⟨c⟩₁₂₈‖⟨b⟩₁₂₈‖⟨h⟩₁₂₈"},
    kind: "lattice",
    rows: 5,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "Paff · 20 条 128 位 lane",
    subtitle: "一格 = 一条 128 位 lane S_j（j = 4y + x）= 一个 XMM 寄存器 = AES 的 4×4 字节矩阵；20 格合计 2560 位",
    bands: [{"from":[0,0],"to":[3,2],"label":"rate　S₀–S₁₁","color":"#6b5fc4"},{"from":[0,3],"to":[3,4],"label":"capacity　S₁₂–S₁₉","color":"#8a8f98"}],
    xTicks: ["x = 0","x = 1","x = 2","x = 3"],
    yTicks: ["S₀–S₃","S₄–S₇","S₈–S₁₁","S₁₂–S₁₅","S₁₆–S₁₉"],
    cellNames: ["S₀","S₁","S₂","S₃","S₄","S₅","S₆","S₇","S₈","S₉","S₁₀","S₁₁","S₁₂","S₁₃","S₁₄","S₁₅","S₁₆","S₁₇","S₁₈","S₁₉"],
    unitName: "lane",
    ops: [
      { kind: "aesRound", steps: ["SubBytes","ShiftRows","MixColumns"], captions: ["lane 内 16 个 AES S 盒，差分均匀度 4、代数次数 7","lane 内按行的字节循环左移","lane 内按列乘 MDS，分支数 5"], cap: "A · AES 轮（19 条 lane 并行，S₁₁ 除外）", formula: "A(X) = MixColumns ∘ ShiftRows ∘ SubBytes", laneCount: 19, note: "无轮密钥异或；一条 lane = 一条 AESENC，19 条互不依赖，全置换 24 × 19 = 456 次。S₁₁ 不走这条路，见下一步。", skip: [[3,2]], inCap: "20 条 lane 里有 19 条各过一次无轮密钥的 AES 轮", depNote: "S₁₁ 不走这条路：它在下一步被轮常数整块替换" },
      { kind: "const", axis: "cells", cells: [[3,2]], cap: "RC · 轮常数只进 S₁₁", formula: "T_{i,11} = RC_i（整块替换）", note: "S₁₁ 是 ΓR 里唯一的 0：它不做 AES，中间值被 RC_i 整块顶替而不是异或。经 p₁ 后这一块落到输出位 j = 7，即 S_{i+1,7} = RC_i ⊕ S_{i,8}；每轮有 128 bit 不经过非线性。常数取自 π 的小数展开。", unitBits: 128, injSym: "← RC", injShort: "RC", injTitle: "RC_i 是整块 128 位常数，把 S₁₁ 的中间值整块顶替（不是异或）", replace: true, passNote: "其余 19 条中间值保留上一步 AES 的输出" },
      { kind: "permute", samples: [[0,0],[1,0],[0,1],[3,2]], cap: "p₁ · 更新路径重排", formula: "U[j] = T[p₁(j)]\np₁(0)=19，p₁(7)=11", note: "格内显示输出位置 U[j] 的源 T 下标；高亮追踪 4 个示例，包含轮常数 T[11] → U[7]。这一步之后仍需与原始 S 的 p₂ 分支异或。", labelAllSources: true, map: function (x, y) { return [[5,19,18,13,1,9,2,17,8,4,11,7,14,6,15,10,12,3,16,0][y*4+x]%4, Math.floor([5,19,18,13,1,9,2,17,8,4,11,7,14,6,15,10,12,3,16,0][y*4+x]/4)]; } },
      { kind: "laneMix", target: 0, sources: [19,1], supportNote: "以输出 lane 0 为例：p₁(0) = 19、p₂(0) = 1，故 S_{i+1,0} = T_{i,19} ⊕ S_{i,1}；20 个输出各取这样一对，没有任何旋转。", cap: "⊕p₂ · 原状态耦合", formula: "S_{i+1,j} = T_{i,p₁(j)} ⊕ S_{i,p₂(j)}\np₂ 循环结构 (0 1)(2 3 4 5)(6 7 8 9 10)(11…19)", note: "T 来自 AES/轮常数路径，S 来自本轮开始前保留的原状态。p₁ 决定 T 的源，p₂ 决定 S 的源；T19 与 S1 不能当成同一数组的两格。", exprLabel: "S_{i+1,0} = T_{i,19} ⊕ S_{i,1}", sourceLabels: {"1":"S1","19":"T19"}, outputLabel: "Y0", leftTitle: "本步输入 · 变换 T 与保留的 S", rightTitle: "本步输出 · 下一轮状态", inCap: "T19 是 AES 输出；S1 是保留的原始 lane", depNote: "Y0 = T19 ⊕ S1；两份状态来源分别着色", detailTitle: "两份状态汇合 · 不能丢失原状态 S" }
    ]
  };
  S.qilin = {
    construction: {"kind":"sponge","feedforward":false,"tag":"带 IV 的标准海绵 · pad 10*1","perm":"Qilin-f\n3136 位 · 12 轮","rateBits":"r = 2112 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"取 S_r 前 h 位，h ≤ r 故无需挤出","note":"首个状态输入为 M₁ ‖ 0^{c/2} ‖ IV：M₁ 恰为 r 位，总长度为 r+c = 3136 位。哈希用途 IV = 0^{c/2}，因此等价于零初态标准海绵。填充 M ‖ 1 ‖ 0* ‖ 1。全部实例 h ≤ r，吸收结束后直接截取 rate 的前 h 位，无需额外置换。"},
    kind: "lattice",
    rows: 7,
    cols: 7,
    xLabel: "",
    yLabel: "",
    title: "Qilin-f · 7 × 7 条 64 位 lane",
    subtitle: "一格 = 一条 64 位 lane（下标为 行,列）；7 列各走一次 L、7 行各走一次 Q；49 格合计 3136 位",
    xTicks: ["列 0","列 1","列 2","列 3","列 4","列 5","列 6"],
    yTicks: ["行 0","行 1","行 2","行 3","行 4","行 5","行 6"],
    cellNames: ["x₀₀","x₀₁","x₀₂","x₀₃","x₀₄","x₀₅","x₀₆","x₁₀","x₁₁","x₁₂","x₁₃","x₁₄","x₁₅","x₁₆","x₂₀","x₂₁","x₂₂","x₂₃","x₂₄","x₂₅","x₂₆","x₃₀","x₃₁","x₃₂","x₃₃","x₃₄","x₃₅","x₃₆","x₄₀","x₄₁","x₄₂","x₄₃","x₄₄","x₄₅","x₄₆","x₅₀","x₅₁","x₅₂","x₅₃","x₅₄","x₅₅","x₅₆","x₆₀","x₆₁","x₆₂","x₆₃","x₆₄","x₆₅","x₆₆"],
    unitName: "lane",
    ops: [
      { kind: "columnMix", axis: "column", index: 3, sym: "L", cap: "L · 一列 7 条 lane 整体进", formula: "y_i ← y_{n1[i]} ⊕ (y_{n2[i]} ≪ m_i)　i = 7…34\n28 次移位异或，其中 16 次带真旋转（12 个 m_i = 0）", detailTitle: "同一个 L 在其余 6 列并行执行", detail: "每列 28 XOR + 16 ROL ⇒ 整轮 196 XOR + 112 ROL；差分分支数 22、线性分支数 17，1 个活跃输入位至少引出 24 个活跃输出位，逆方向 1 位至少 205 位。", note: "不是 MDS、没有有限域乘法；L = p₁ ∘ p₂ ∘ p₁ 使硬件可只例化 p₁ 一次跑三遍。具体的 n1/n2 索引表与 28 个 m_i 见文档 Table 1.2。" },
      { kind: "laneShift", axis: "row", amount: function (i) { return [0,1,2,3,4,5,6][i]; }, sample: 3, unitName: "行", cap: "ρQ · 行 i 向右搬移 i 格", formula: "Y[i,j] = X[i,(j−i) mod 7]", note: "高亮第 3 行，源位置 0 → 目标位置 3；输出依次来自源位置 4、5、6、0、1、2、3。其他行按各自下标循环搬移。", dir: "right" },
      { kind: "sbox", axis: "row", index: 3, width: 7, parallelNote: "× 64 个 z 切片 × 7 行 = 448 个 7 位 S 盒 / 轮", cap: "Q · 两层 χ₇ 复合（步幅 1 与 3）", formula: "第一层 tᵢ：步幅 1　t₀=(a₁∧a₂)⊕a₀ … t₆=(a₀∨a₁)⊕a₆\n第二层 bᵢ：步幅 3　b₀=(t₀∧t₅)⊕t₂ … b₆=(t₂∨t₀)⊕t₄", note: "DU = 8、线性度 40、正向代数次数 4（逆 5）。两层步幅不同（1 与 3）使差分/线性性质不会简单叠加；AND 与 OR 混用是把 lane complementing transform 内化成算法本身，实现里 NOT 数为 0。每层 7 AND/OR + 7 XOR，一个 S 盒 28 条 64 位字操作。", inCap: "高亮 lane 的同一位组成 7 比特输入" },
      { kind: "laneShift", axis: "column", amount: function (i) { return [0,1,2,3,4,5,6][i]; }, sample: 3, unitName: "列", cap: "ρL · 列 j 向下搬移 j 格", formula: "Y[i,j] = X[(i−j) mod 7,j]", note: "高亮第 3 列，源位置 0 → 目标位置 3；输出依次来自源位置 4、5、6、0、1、2、3。其他列按各自下标循环搬移。", dir: "right" },
      { kind: "const", axis: "cells", cells: [[0,0]], bits: [0,1,2,4,6,7,8,9,10,11,12,13,14,17,24], cap: "C · 轮常数只进 x₀₀", formula: "x₀,₀ ← x₀,₀ ⊕ C_t", note: "C_t 的 15 个 LFSR 位落在蓝色标出的 15 个位置，实际值随轮次变化，其余 49 位恒为 0。第 0 轮 C₀ = 0x0000000001027FD7；这张位置图展示常数支持集，不展示某一轮的比特值。", injTitle: "蓝色标出 15 个可能注入的位置（不表示全部为 1）", bitIndexOrder: "lsb-first" }
    ]
  };
  S.qsh = {
    construction: {"kind":"tree","tag":"二叉 Merkle 树 · BLAKE3 式树模式","chunks":4,"blocksPerChunk":2,"leafBox":"F₃,w","parentBox":"PARENT","rootBox":"ROOT","leafLabel":"chunk 内部串行，chunk 之间互不依赖，可并行计算","outLabel":"摘要 512 bit","outSub":"根节点链值截断","flagLabel":"ROOT 与 PARENT/CHUNK_END 等标志组合，作用于最后一次实际压缩；不是额外多做一次 ROOT 置换。","note":"树节点调用同一 F₃,w，chunk 内串行、chunk 之间可并行；消息在置换前后分别模加进两个状态半部。原语无轮常数，9/18 完整轮加末尾列层。公开论坛报告了自由全状态输入下的平移不变子空间；作者回应首个合法压缩输入不落在该子空间，未发布修订。"},
    kind: "lattice",
    rows: 16,
    cols: 4,
    xLabel: "x₀",
    yLabel: "(x₂,x₁)",
    title: "ChaCha Bahru · 4×4×4 立方体",
    subtitle: "列为 x₀，行号 r=4x₂+x₁；线性下标 i=16x₀+r。64 格每格 w=32/64 位，一行四字沿 x₀ 是一次 G 的输入；QSH-512 的消息注入下标 32…63，即右侧两列。",
    bands: [{"from":[0,0],"to":[1,15],"label":"i<32 · 置换后 ⊞ M","color":"#3f85d6"},{"from":[2,0],"to":[3,15],"label":"i≥32 · 置换前 ⊞ M","color":"#8a8f98"}],
    xTicks: ["x₀=0","x₀=1","x₀=2","x₀=3"],
    yTicks: ["00","01","02","03","10","11","12","13","20","21","22","23","30","31","32","33"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "row", index: 0, width: 4, parallelNote: "× 16 组 = 每遍 16 个并行 G，每轮 3 遍共 48 个 G、192 次模加", cap: "G · 四字 ARX 变换", formula: "a = a ⊞ (b ⋘ σ₁)    d = (d ⊕ a) ⋘ τ₁\nc = c ⊞ (d ⋘ σ₂)    b = (b ⊕ c) ⋘ τ₂\na = a ⊞ (b ⋘ σ₃)    d = (d ⊕ a) ⋘ τ₃\nc = c ⊞ (d ⋘ σ₄)    b = (b ⊕ c) ⋘ τ₄\nw=32：σ = (1,15,0,8)，τ = (16,12,8,7)", note: "G 不是查表 S 盒而是 4 个字的 ARX 变换，这里借 S 盒算子表示「4 条 lane 一起进一个非线性函数」；差别是它没有 DDT，非线性来自模加的进位。一个 G = 4 次模加 + 4 次异或 + 7 次旋转（σ₃ = 0 让第三步的旋转退化为恒等）= 15 个字操作，8 步串行执行。" },
      { kind: "permute", samples: [[1,1],[2,5],[3,11],[0,15]], labelAllSources: true, cap: "P16 · (x₀,x₁) 平面换位", formula: "输出 A[x₀,x₁,x₂] = 输入 A[x₀,(x₁+x₀) mod 4,x₂]", note: "本图展示第二遍 G 前的 plane-0 P16；第三遍改在 (x₁,x₂) 平面做 P16。源→目的映射按文档坐标定义绘制；每遍之后使用对应逆置换恢复坐标。", map: function (x, y) { return [x,(y-y%4)+(y%4-x+4)%4]; } },
      { kind: "directions", current: 0, cap: "R_{3,w} · 一轮三遍", formula: "第 1 遍沿 x₀：16 × G\n第 2 遍：P16(x₀,x₁) → 16 × G(x₀) → P16⁻¹\n第 3 遍：P16(x₁,x₂) → 16 × G(x₁) → P16⁻¹", note: "三遍依次执行，每轮 48 次 G；QSH-512 为 9 完整轮加末尾 16 次沿 x₀ 的 G，合计 448。没有轮常数，末尾列层是部分轮，不是又一个完整轮。", sequential: true, panelLabels: ["第 1 遍","第 2 遍","第 3 遍"], detailTitle: "三遍在同一轮内依次执行，每轮 48 个 G", groupCounts: [16,16,16], directions: [
        { label: "第一遍 · 沿 x₀ 轴的列", group: function (c, r) { return r; } },
        { label: "第二遍 · (x₀,x₁) 平面对角线", group: function (c, r) { return (r-r%4)+(r%4-c+4)%4; } },
        { label: "第三遍 · (x₁,x₂) 平面对角线", group: function (c, r) { return 4*c+((r-r%4)/4-r%4+4)%4; } }
      ] },
      { kind: "const", axis: "cells", cells: [[0,0]], cap: "F_{3,w} · flag ⊕ S₀", selCap: "64 个字里只有 S₀ 接域分离标志", formula: "S_j = H_j,  S_{v+j} = H_{v+j} ⊞ M_j,  S₀ ^= flag\nH'_j = S_j ⊞ M_j,  H'_{v+j} = S_{v+j}\nflag ∈ {CHUNK_START=1, CHUNK_END=2, PARENT=4, ROOT=8} 的按位或", note: "格子突出压缩入口 S₀ 的 flag：消息同时在下标 32…63 做预置换模加，置换后在 0…31 做模加。这里是压缩接口说明，不是每轮都加 flag。", unitBits: 32, bits: [0,1,2,3], injSym: "⊕ flag", injShort: "flag", injTitle: "flag 的可能非零位：bit0…3；组合值按适用标志按位或", bitIndexOrder: "lsb-first" }
    ]
  };
  S.taichi = {
    construction: {"kind":"sponge","feedforward":false,"tag":"Interleaved Feistel Sponge · 1 条 rate + 2 条 capacity","perm":"P1920 · 12 轮\n每 Step 调 2 次","rateBits":"r = 1408 bit","capBits":"c = 512 bit × 2","capName":"capacity L / R","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"从 rate 分支 S 读出","note":"每个 Step：先将消息 XOR 到 S、域码 enc(D) XOR 到 L，再 (A,B)=P1(S‖L)，(S′,C)=P2(A‖(R⊕B))，最后 L′=C、R′=B⊕C。普通块 D=AB(1)、末块 D=FIN(2)，SQ(3) 留给挤出；P1/P2 均 12 轮并使用不同常数流。图画一个完整 Step；逻辑状态 S‖L‖R 共 2432 位（512 实例），单次置换宽度 1920。","ifs":true,"railNames":["S · rate","L · capacity","R · capacity"],"perm1":"P1","perm2":"P2","stepLabel":"末尾 L ← C、R ← B ⊕ C 交织"},
    kind: "lattice",
    rows: 6,
    cols: 5,
    xLabel: "j",
    yLabel: "i",
    title: "P1920 · 6 × 5 的 64 位 lane 阵列",
    subtitle: "一格 = 一条 64 bit lane = 状态的一个 x_{i,j}；6 × 5 = 30 条 lane 合计 1920 bit，lane 编号 n = 5i + j",
    xTicks: ["j=0","j=1","j=2","j=3","j=4"],
    yTicks: ["i=0","i=1","i=2","i=3","i=4","i=5"],
    cellNames: ["n0","n1","n2","n3","n4","n5","n6","n7","n8","n9","n10","n11","n12","n13","n14","n15","n16","n17","n18","n19","n20","n21","n22","n23","n24","n25","n26","n27","n28","n29"],
    unitName: "lane",
    ops: [
      { kind: "columnMix", axis: "column", index: 0, sym: "L", cap: "MRM 线性层 · 整列 6 条 lane", formula: "for i = 6..21:  y_i ← y_{n1[i]} ⊕ (y_{n2[i]} ⋘ m_i)\n输出 (y16⋘0, y17⋘15, y18⋘48, y19⋘63, y20⋘6, y21⋘33)", detailTitle: "5 个并行的 6 字 MRM 核，一列一个", detail: "MRM 顺序生成 y₆…y₂₁；n1=(0,1,2,4,3,5,6,7,13,14,15,16,15,18,11,20)，n2=(1,2,4,3,5,6,0,11,8,9,10,12,17,14,19,13)，m=(8,0,0,0,0,0,23,62,35,14,48,1,57,63,58,22)。最后 ROTL 输出 y₁₆…y₂₁，旋转为 0/15/48/63/6/33。", note: "n1[i]、n2[i] 与 m_i 的具体下标见文档 Table 1.3；方法论与 QILIN 同源于 [YL25] 的 multiple-rows mixer。" },
      { kind: "sbox", axis: "row", index: 0, width: 5, parallelNote: "× 64 个 z 切片 × 6 行 = 384 个 5-bit S 盒 / 轮", cap: "Q · 位切片 5 位 APN S 盒", formula: "b0 = a1 ⊕ (a0∧a1) ⊕ a2 ⊕ (a1∧a2) ⊕ a3 ⊕ (a3∧a4)\nb1 = 1 ⊕ a1 ⊕ (a0∧a3) ⊕ (a1∧a3) ⊕ a4 ⊕ (a2∧a4)\nb2 = (a1∧a2) ⊕ a3 ⊕ (a2∧a3) ⊕ a4 ⊕ (a0∧a4)\nb3 = (a0∧a2) ⊕ (a1∧a3) ⊕ (a2∧a3) ⊕ a4\nb4 = a0 ⊕ (a2∧a3) ⊕ (a1∧a4)", note: "APN / AB：DU = 2（MDP 2⁻⁴）、最大 |LAT| = 8（相关 2⁻²）、正向次数 2 逆向 3、无不动点；文档给出维数 ≥ 2 的可线性化仿射子空间数为 0。位切片实现只用 AND 与 XOR。" },
      { kind: "permute", samples: [[0,0],[4,0],[0,3],[4,5]], cap: "Π₁₀ · lane 整体换位", formula: "n' = (10(n+1) mod 31) − 1,   n = 5i + j\nord₃₁(10) = 15 ⇒ 两个长度 15 的轮换", note: "只换 lane 的坐标、不改 lane 内部，硬件上是纯布线。TaiChi 没有 ρ 层，lane 内旋转全靠 MRM 内部的 16 个旋转。", labelAllSources: true, map: function (x, y) { return [((10*(5*y+x+1))%31-1)%5, Math.floor(((10*(5*y+x+1))%31-1)/5)]; } },
      { kind: "const", axis: "cells", cells: [[0,0],[1,0],[2,0],[3,0],[4,0]], cap: "A · 5 个常数只进第 0 行", formula: "p(z) = z⁷ + z + 1,   s₀ = 1\nq = (b−1)·60 + 5t + j；P1 取 0…59，P2 取 60…119", selCap: "30 条 lane 里只有第 0 行的 5 条参与", bits: [0,2,3,6,13,28,59], note: "7 个 LFSR 位只能落在 P = {0, 2, 3, 6, 13, 28, 59} 这 7 个固定位置，所以每个常数最多 7 个非零位，前 5 个（0x1、0x4、0x8、0x40、0x2000）汉明重量只有 1。P1 与 P2 的区别在于这条常数流；模式证明将二者建模为两个独立的理想置换。", bitIndexOrder: "lsb-first", injTitle: "LFSR 的 7 个可能置位位置；不是每个 RC 都有 7 个 1" }
    ]
  };
  S.thunder = {
    construction: {"kind":"sponge","feedforward":true,"tag":"前馈海绵 Sponge-FP · 容量侧前馈","perm":"Thunder-p\n1600 位 · 12 轮","rateBits":"r = 1024 bit","capBits":"inner = 576 bit","capName":"inner","outFrom":"capacity","outLabel":"截取 inner","outSub":"h < c，零次额外置换","ffLabel":"置换前保存 inner，置换后异或回 inner","note":"与标准海绵的差别只在橙色这条线：S ← right_c(X) 先取出吸收后的 inner，置换完再异或回去，使每次调用变成只作用于 inner 的 Davies–Meyer 型不可逆映射。标准海绵要 c ≥ 2h 才有 h 位原像安全（1024 位摘要需要超过 2048 位的置换），前馈把原像安全提高到约 min{c, h}，于是 c = h + 64 就够，1600 位置换覆盖到 Thunder-1024。填充 pd10*，末块把 C = 0^{c−1}‖1 异或进 capacity；摘要从 inner 侧读，这两点一起封堵长度扩展。模式的界引自 Guo et al.（CRYPTO 2026），设计文档只做参数代入，未另行证明。","ivLabel":"IV = 每实例独立的 c 位常数","finalTag":"末块 C → inner","finalTagNote":"先注入末块 C，再保存 inner，随后置换与容量前馈。"},
    kind: "lattice",
    rows: 5,
    cols: 5,
    xLabel: "",
    yLabel: "",
    title: "Thunder-p · 5 × 5 条 64 位 lane",
    subtitle: "一格 = 一条 64 位 lane，线性索引 idx = 5y + x；inner 是 L0–L8（576 位），rate 是 L9–L24（1024 位），25 格合计 1600 位",
    xTicks: ["x = 0","x = 1","x = 2","x = 3","x = 4"],
    yTicks: ["y = 0","y = 1","y = 2","y = 3","y = 4"],
    cellNames: ["L0","L1","L2","L3","L4","L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15","L16","L17","L18","L19","L20","L21","L22","L23","L24"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], bits: [0,1,3,7,15], cap: "ι · 轮常数只进 L0", formula: "D[0,0] ← D[0,0] ⊕ RCᵢ　i = 0…11", note: "12 个轮常数由本原多项式 G(x) = x⁵ + x² + 1 的 5 级仿射 LFSR 生成，5 个输出位只落在上图蓝色的第 0、1、3、7、15 位；1600 位状态里这一步只碰 64 位，其中至多 5 位非零。六个成员共用同一个置换，实例之间靠各自独立的 c 位 IV 分离。", bitIndexOrder: "lsb-first" },
      { kind: "laneRotate", sample: [1,0], amountLabel: "τ(x,y)", cap: "ρ · 25 条 lane 各自循环右移", formula: "D[x,y] ← ROTR(D[x,y], τ[x,y])", note: "逐格显示 Table 3 的 25 项 τ(x,y)；D′[x,y,z]=D[x,y,z+τ] 对应 ROTR64，τ(2,2)=0。", inCap: "每条 lane 有各自的移位量 τ(x,y)，图中只在示例格标出", amounts: function (c, r) { return [[45,33,13,1,27],[40,52,19,47,9],[34,5,0,2,37],[48,30,61,8,38],[6,18,49,17,43]][r][c]; }, dir: "right" },
      { kind: "parity", index: 2, cap: "θ · 双列奇偶（twin CPM）", formula: "P[x,z] = ⊕_y D[x,y,z]　Q[x,z] = ⊕_y D[x,y,z+t_y]\nE[x,z] = P[x,z] ⊕ P[x−1,z+1]　F[x,z] = Q[x+1,z] ⊕ Q[x−2,z+36]\nD′[x,y,z] = D ⊕ E[x,z+26] ⊕ F[x,z+26+t_y]", p: "P[x] 直接列奇偶", q: "Q[x] 带行移位的列奇偶", note: "t_y = (41, 50, 6, 10, 27) 同时出现在 Q 的计算与最终注入里，这是「对称」构造的要点，避免非对称 twin CPM 的转置映射退化。文档给出差分与线性分支数均为 12（Keccak 的 θ 只有 4），差分与线性分析都以此为基础。硬件约 6400 个 XOR2/轮，为 Keccak θ 的两倍。", srcIndex: 1, srcLabel: "x−1 → x（部分来源）", depNote: "全状态每条 lane 均更新；高亮为示例列", detail: "P 为直接列奇偶，Q 为带行旋转的列奇偶；E 使用 P[x]、P[x−1]，F 使用 Q[x+1]、Q[x−2]，二者按 y 再旋转后加回各 lane。" },
      { kind: "permute", samples: [[1,0],[0,2],[3,1],[2,4]], cap: "π · lane 坐标仿射重排", formula: "(x, y) → (y, 2x + 3y + 2 mod 5)", note: "与 Keccak 的 π（(x,y) → (y, 2x+3y)）差一个常数项 +2。纯位置置换，不动 lane 内部任何比特：软件中可通过变量换名实现，不需要额外指令；硬件上是布线，不占逻辑门。", labelAllSources: true, map: function (x, y) { return [y,(2*x+3*y+2)%5]; } },
      { kind: "sbox", axis: "column", index: 2, width: 5, parallelNote: "× 64 个 z 切片 × 5 列 = 320 个 5 位 S 盒 / 轮", cap: "ψ · 沿 y 方向的三次映射", formula: "D′[x,y] = D[x,y+3] ⊕ ¬D[x,y+1] · D[x,y+2] · ¬D[x,y+4]", note: "方向与 Keccak 的 χ（沿 x）相反。差分均匀度 14、线性度 24、代数次数正逆均为 3；Keccak 的 χ 分别为 8、16、2，设计以 θ 的分支数 12 弥补。DDT 非行平坦（取值 {2,4,6,8,14}），设计者将其作为抵抗 rebound 攻击的论据。每个输出位只需 XOR、AND、NOT，可完全位切片。" }
    ]
  };
  S.uhash = {
    construction: {"kind":"chain","tag":"Counter-bDM · b 路并行 Davies–Meyer","box":"CF · b 路并行","boxSub1":"uBlock-1024 · 52 轮 × b 次调用","boxSub2":"u¹ 当明文，(b−1)n 链值 + (5−b)n 消息 = 1024 位密钥","chainBits":"链值 b × 256 bit（b = 2/3/4）","finalBox":"末块用 CF′","finalSub1":"密钥再异或 (j + 15) 做域分离","finalSub2":"末状态 b 块直接就是摘要，不截断","note":"把 Counter-bDM 的密钥长度从 bn 固定为 4n，多出来的位置全部装消息，uHash-512 的速率从 1/2 提到 3/2；b = 4 时消息只占 256 位。填充是 M‖1‖0* 补到 an 位的整数倍、没有长度编码（无 MD 强化）。摘要为末状态的 b 块，不截断。","dmFeedback":true,"dmLabel":"块内 Davies–Meyer 前馈：u^j_{i+1} = E_{K_i}(u¹_i ⊕ (j−1)) ⊕ u¹_i；(j−1) 是分支序号，与消息块序号无关","msgLabels":["m1（进密钥口）","m2（进密钥口）"],"parallel":{"items":["E_K(u¹ ⊕ 0)","E_K(u¹ ⊕ 1)","⋮","E_K(u¹ ⊕ (b−1))"],"caption":"K = (b−1) 块链值 ‖ (5−b) 块消息"}},
    kind: "lattice",
    rows: 8,
    cols: 8,
    xLabel: "格",
    yLabel: "半块",
    title: "uBlock-1024 · 两半块各展开为 4 × 8 nibble",
    subtitle: "一格 4 位；上四行是 X₀ 的 32 个 nibble，下四行是 X₁。每行 8 格合计一个 32 位字，LM 只混合同位编号的一对上下字；此展开让 PL/PR 的源编号可读。",
    bands: [{"from":[0,0],"to":[7,3],"label":"X₀ · 128 bit","color":"#2f9c8a"},{"from":[0,4],"to":[7,7],"label":"X₁ · 128 bit","color":"#7c8ba1"}],
    yTicks: ["X₀:w0","X₀:w1","X₀:w2","X₀:w3","X₁:w0","X₁:w1","X₁:w2","X₁:w3"],
    cellNames: ["n0","n1","n2","n3","n4","n5","n6","n7","n8","n9","n10","n11","n12","n13","n14","n15","n16","n17","n18","n19","n20","n21","n22","n23","n24","n25","n26","n27","n28","n29","n30","n31","n0","n1","n2","n3","n4","n5","n6","n7","n8","n9","n10","n11","n12","n13","n14","n15","n16","n17","n18","n19","n20","n21","n22","n23","n24","n25","n26","n27","n28","n29","n30","n31"],
    unitName: "nibble",
    ops: [
      { kind: "const", at: [7,7], cap: "分支计数器 ⊕ (j−1)", formula: "u^j 的明文输入 = u¹ᵢ ⊕ (j − 1),   j = 1 … b\n末块另把 (j+15) 异或进 1024 位密钥", bits: [0,1], note: "b 个分支之间唯一的差别就是这几个最低位：b = 4 时也只有 2 个比特。图上画在最低的那个 nibble 上，确切的比特次序见文档。b 路使用完全相同的 1024 位密钥，末块另以 (j+15) 区分。", unitBits: 4, bitIndexOrder: "lsb-first" },
      { kind: "const", axis: "all", cap: "KS · 子密钥异或（密钥 = 链值 ‖ 消息）", formula: "X₀ ← X₀ ⊕ RK₀ⁱ,   X₁ ← X₁ ⊕ RK₁ⁱ\nK ← f(K₂⊕RC_i)‖g(K₅)‖f(K₁)‖g(K₀)‖f(K₃)‖g(K₆)‖f(K₇)‖g(K₄)", selCap: "64 个 nibble 全部异或子密钥", note: "注入的不是固定轮常数，而是从 1024 位密钥（链值 ‖ 消息块）里直接切出来的两个 128 位字；每格只有 4 位，所以比特带只点亮 4 位。密钥每 4 轮更新一次（52 = 4 + 12 × 4），更新函数只有 nibble 置换 f / g 与 8 级 LFSR 轮常数异或，整条密钥编排里没有 S 盒，其中的消息位由输入决定。", injSym: "⊕ K", injShort: "K", injTitle: "轮密钥由当前链值与消息共同生成；固定 IV 的链值不能被攻击者自由指定", unitBits: 4 },
      { kind: "laneFunc", sample: [5,0], sym: "S", cap: "S32 · 4 位 S 盒，一格一个", formula: "s = 3, 0, 6, 2, 5, 4, f, e, a, 8, 7, 9, 1, c, d, b\n每轮 2 × 32 = 64 个 S 盒实例", innerTitle: "一个 nibble 内部：4 位输入 → 4 位输出，查同一张表", stages: ["取 4 位输入 x","查 s[x]","写回同一格"], note: "与按 z 切片取比特的宽 S 盒不同，这里一个 S 盒只处理一个 nibble，格子本身就是 S 盒的粒度。无不动点，最大差分概率与最大线性概率都是 4 位双射的最优值 2⁻²，代数次数达到最大值 3；作者给的硬件指标 11.17 GE / 0.12 ns。", inCap: "图中高亮的是示例格，其余同样处理" },
      { kind: "columnMix", axis: "all", sym: "L", cap: "LM · 6 步移位异或的二元矩阵", formula: "X₁ ⊕= X₀;  X₀ ⊕= X₁⋘₃₂4;  X₁ ⊕= X₀⋘₃₂8\nX₀ ⊕= X₁⋘₃₂8;  X₁ ⊕= X₀⋘₃₂20;  X₀ ⊕= X₁", detailTitle: "GF(2) 上 16 × 16 的最优二元矩阵 · 分支数 8", detail: "6 步异或与 32 位字内循环移位交替作用在 X₀ / X₁ 两行上；移位量 4、8、8、20 位分别对应 1、2、2、5 个 nibble。分支数 8 是该尺寸的最优值，super-S-box 下是 4，3 轮达到全扩散。", note: "四组互不交换，每组由 X₀、X₁ 下标相同的两个 32 位字组成；字内旋转 4/8/8/20 位会改变组内 nibble 的位置。跨组重排由后续 PL/PR 完成。", inCap: "X₀/X₁ 中下标相同的那一对 32 位字", depNote: "6 步全在 32 位字内，等于 4 组互不相干的 16-nibble 混合器，组间不混", groupBy: "groups", groups: [[0,1,2,3,4,5,6,7,32,33,34,35,36,37,38,39],[8,9,10,11,12,13,14,15,40,41,42,43,44,45,46,47],[16,17,18,19,20,21,22,23,48,49,50,51,52,53,54,55],[24,25,26,27,28,29,30,31,56,57,58,59,60,61,62,63]] },
      { kind: "permute", samples: [[0,0],[4,3],[0,4],[6,6]], labelAllSources: true, cap: "PL / PR · 半块各自重排", formula: "输出 z[j] = 输入 y[PL[j]]（上行）；y[PR[j]]（下行）", note: "采用文档 Table 5 全部 64 个来源下标。PL、PR 各自双射，上下半块不混；示例连线标出源→目的，输出格编号表示源下标。", map: function (x, y) { return [[[25,27,29,16,18,21,30,22,31,28,17,26,24,23,20,19,2,9,1,13,15,14,5,7,10,12,3,8,0,6,4,11],[0,2,1,12,9,11,10,7,5,14,8,4,3,6,13,15,26,25,17,27,22,31,16,19,20,28,30,18,23,24,29,21]][Math.floor(y/4)][(y%4)*8+x]%8,Math.floor([[25,27,29,16,18,21,30,22,31,28,17,26,24,23,20,19,2,9,1,13,15,14,5,7,10,12,3,8,0,6,4,11],[0,2,1,12,9,11,10,7,5,14,8,4,3,6,13,15,26,25,17,27,22,31,16,19,20,28,30,18,23,24,29,21]][Math.floor(y/4)][(y%4)*8+x]/8)+Math.floor(y/4)*4]; } }
    ]
  };
  S.vedak = {
    construction: {"kind":"sponge","feedforward":false,"tag":"标准海绵 · pad10*1","perm":"Vedak-p · 2560 位\n40 轮","rateBits":"r = 1536 bit","capBits":"c = 1024 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"从 rate 读出，capacity 从不输出","note":"三个实例使用 pad10*1 与全零 IV，r/c 分别为 1536/1024、1024/1536、512/2048。1024 位摘要超过 512 位 rate，需要在挤出阶段继续置换后拼接输出。"},
    kind: "lattice",
    rows: 10,
    cols: 8,
    xLabel: "",
    yLabel: "",
    title: "Vedak-p · 10 行 × 8 个 32 位字",
    subtitle: "一格 = 32 位 = 8 个 nibble；两格组成一个 64 位字。λ 在 8 列并行作用，ψ 在每行重排 8 个块，再分别旋转每个 32 位块。",
    bands: [{"from":[0,0],"to":[7,5],"label":"rate · 1536 bit","color":"#b8763a"},{"from":[0,6],"to":[7,9],"label":"capacity · 1024 bit","color":"#8a8f98"}],
    xTicks: ["k=0","k=1","k=2","k=3","k=4","k=5","k=6","k=7"],
    yTicks: ["i = 0","i = 1","i = 2","i = 3","i = 4","i = 5","i = 6","i = 7","i = 8","i = 9"],
    cellNames: ["V0.0","V0.1","V0.2","V0.3","V0.4","V0.5","V0.6","V0.7","V1.0","V1.1","V1.2","V1.3","V1.4","V1.5","V1.6","V1.7","V2.0","V2.1","V2.2","V2.3","V2.4","V2.5","V2.6","V2.7","V3.0","V3.1","V3.2","V3.3","V3.4","V3.5","V3.6","V3.7","V4.0","V4.1","V4.2","V4.3","V4.4","V4.5","V4.6","V4.7","V5.0","V5.1","V5.2","V5.3","V5.4","V5.5","V5.6","V5.7","V6.0","V6.1","V6.2","V6.3","V6.4","V6.5","V6.6","V6.7","V7.0","V7.1","V7.2","V7.3","V7.4","V7.5","V7.6","V7.7","V8.0","V8.1","V8.2","V8.3","V8.4","V8.5","V8.6","V8.7","V9.0","V9.1","V9.2","V9.3","V9.4","V9.5","V9.6","V9.7"],
    unitName: "32 位字",
    ops: [
      { kind: "laneFunc", cap: "ν · 4 位 S 盒，作用在每个 nibble 内部", formula: "s = [1,0,5,6,C,9,2,8,A,7,3,F,E,B,4,D]\n差分均匀度 4　非线性度 4　次数 3", note: "一格 32 位 = 8 个 nibble；80 格共 640 个 S 盒 / 轮。", sample: [0,0], sym: "ν", innerTitle: "一个 32 位字：8 个 nibble 各自应用同一 S 盒", stages: ["取 4 位输入 x","查 s[x]","写回同一 nibble"], inCap: "图中高亮的是示例格，其余同样处理", depNote: "S 盒完全作用在单个 nibble 内部，不跨字" },
      { kind: "columnMix", axis: "column", index: 0, sym: "λ", detailTitle: "10×10 二元扩散矩阵 · 分支数 6", detail: "每列 10 个 32 位字乘同一个 10×10 二元矩阵。8 列并行，等价于文档的 4 列 64 位字视图。", cap: "λ · 逐列扩散", formula: "Y[·][j] = M · X[·][j],　j = 0 … 3", note: "矩阵并非每个输出都依赖全部 10 个输入：各输出为其中 5 或 6 个输入的异或。", depNote: "M 的前 5 行行重 5、后 5 行行重 6，每个输出只依赖 10 条里的 5 或 6 条" },
      { kind: "permute", samples: [[0,0],[1,0],[4,0],[1,6]], labelAllSources: true, cap: "ψ₁ · 32 位块重排", formula: "Y[i,k] = X[i,Pw[i,k]]\n第 0 行 Pw = (5,4,7,6,1,0,3,2)", note: "完整映射见文档 Table 2（PI 与 ALPHA）。格内显示该输出块的原输入名称。", inCap: "颜色跟踪 4 个示例块；每行 8 个块参与", depNote: "输出格内标注原输入块，块内比特此时不变", map: function (x, y) { return [[[5,4,7,6,1,0,3,2],[2,3,0,1,6,7,4,5],[6,7,4,5,2,3,0,1],[7,6,5,4,3,2,1,0],[3,2,1,0,7,6,5,4],[0,1,2,3,4,5,6,7],[0,1,3,2,4,5,7,6],[4,5,7,6,0,1,3,2],[5,4,6,7,1,0,2,3],[1,0,2,3,5,4,6,7]][y][x],y]; } },
      { kind: "laneRotate", amounts: function (c, r) { return [16,4,12,0,28,0,20,12,20,4][r % 10]; }, sample: [0,1], dir: "right", unitBits: 32, cap: "ψ₂ · 每个 32 位块内旋转", formula: "ROTR32(block, mᵢ)\nm = [16,4,12,0,28,0,20,12,20,4]", note: "按整数位编号（最低位为 0）显示为右旋；文档以 nibble 串记作 ≪₃₂。旋转独立作用在高、低 32 位块，不能画成 64 位整字旋转。" },
      { kind: "const", at: [0,0], cap: "ω · 第一个 32 位字", formula: "V[0,0] ⊕= RC[r]；RC[0] = 0x2c387d69", bits: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31], note: "常数注入首个 64 位字的高 32 位；拆成 32 位块后就是 V[0,0]。高亮为常数支撑范围。", unitBits: 32, bitIndexOrder: "lsb-first" }
    ]
  };
  S.wchain = {
    construction: {"kind":"chain","tag":"FChain · 两步 Fibonacci 反馈","box":"CF 压缩函数","boxSub1":"9 × 64 位 · 18 轮 · DM 型前馈","boxSub2":"每块吃 1152 位消息","chainBits":"H = 9 × 64 = 576 bit","skipEdge":true,"skipLabel":"FChain 两步反馈：新链值同时依赖前两个链值，所以起点要两个初值 H₋₁ 与 H₀","finalBox":"校验和终结","finalSub1":"Σ = M₁ ⊕ … ⊕ M_l","finalSub2":"576 → 512 位截断","note":"IV 与 H₋₁ 都是全零，填充只有 10*、不附加长度域；Σ 本身不计入累加器，最终块也不走两步反馈。","msgLabels":["M1","M2"],"ivLabel":"H₋₁ = 0, H₀ = IV"},
    kind: "lattice",
    rows: 3,
    cols: 3,
    xLabel: "",
    yLabel: "",
    title: "WChain-p · 9 条 64 位 lane",
    subtitle: "一格 = 一条 64 位 lane A[x,y]，下标 i = 3x + y；9 格合计 576 位，每个 z 切片上的 9 个比特凑成一个 9 位 S 盒，全状态只有 64 个 S 盒列",
    xTicks: ["y = 0","y = 1","y = 2"],
    yTicks: ["x = 0","x = 1","x = 2"],
    cellNames: ["X0","X1","X2","X3","X4","X5","X6","X7","X8"],
    unitName: "lane",
    ops: [
      { kind: "const", axis: "all", cap: "ι · 轮常数 + 消息扩展字，进全部 9 条 lane", formula: "X[i] ← X[i] ⊕ ROTL₆₄(zext₆₄(πⱼ¹⁶), i) ⊕ B̂ⱼ₋₁[i]", selCap: "18 次异或：9 条常数 + 9 条消息扩展字 B̂ⱼ₋₁", note: "16 位常数零扩展到 64 位后再按 lane 下标 i 循环左移 i 位，所以 9 条 lane 拿到的是同一个源常数的 9 个不同旋转；文档给出由此诱导的 9 位列常数秩为 9。", passNote: "常数按 lane 旋转；消息扩展字的影响不限于低 16 位" },
      { kind: "sbox", axis: "all", width: 9, cap: "χ₉ · 9 位非线性层", formula: "bᵢ = aᵢ ⊕ (aᵢ₊₁ ∨ ¬aᵢ₊₂)   下标 mod 9", parallelNote: "× 64 个 z 切片 = 64 个并行的 9 位 S 盒 / 轮，整层 9 NOT + 9 OR + 9 XOR", note: "双射，正向代数次数 2、逆向 5；DDT_max = 128/512（差分概率 2⁻²），|LAT|_max = 128（线性相关 2⁻¹）。此处 LAT=Σ(-1)^(α·x⊕β·S(x))/2，128 对应 Walsh 256，归一化相关为 1/2。" },
      { kind: "permute", samples: [[1,0],[2,0],[1,1],[2,2]], cap: "π · 列内位置重排", formula: "π = (0,7,5,3,1,8,6,4,2)，C[π(i)] = U[i]", note: "纯布线，不改变 DDT/LAT，唯一作用是打乱 S 盒输出坐标与 L5w 五字支撑集的对齐；软件中可与 L5w 合并，本身不需要指令。", labelAllSources: true, map: function (x, y) { return [[0,7,5,3,1,8,6,4,2][3*y+x]%3, Math.floor([0,7,5,3,1,8,6,4,2][3*y+x]/3)]; } },
      { kind: "laneMix", target: 0, sources: [0,1,2,3,7], cap: "L5w · 五字稀疏扩散", formula: "Y[i] = ⊕_{k ∈ Iᵢ} ROTL64(X[k], r_{i,k})", supportNote: "展示置换后的 X：Y0 使用 X0、X1、X2、X3、X7，分别 ROTL64 5、22、3、28、27 位；其余输出支撑平移，旋转量逐行见 Table 4。", detailTitle: "L5w：每条输出 lane 只吃 9 条中的 5 条", note: "满秩 576；1/2/3 比特分支数正向与转置都是 6/8/12（精确枚举）；矩阵 2880 个 1 而逆矩阵 164416 个 1，即正向稀疏、逆向稠密。4 比特定向搜索最好分支数 14，未找到 4-to-4 迭代核。", rotations: [5,22,3,28,27] }
    ]
  };
  S.wish = {
    construction: {"kind":"sponge","feedforward":true,"tag":"Tweakable Sponge-F · 容量前馈 + 块计数器","perm":"Wish-P\n1024 位 · 9 步","rateBits":"R = 512 bit","capBits":"C = 512 bit","capName":"capacity","outFrom":"capacity","outLabel":"H ← C","outSub":"摘要就是最终 capacity","ffLabel":"置换前保存 C，置换后异或回 C","note":"填充 pd10*；末块把 θ = 0^{c−1}1 异或进 capacity 作终止化。除容量前馈外，每个消息块还带一个独立的 128 位 tweak τᵢ = enc64(块序号) ‖ 0⁶⁴，把「第几块」从状态移入 tweak，块位置不再占用容量空间，与 c = h + 64 的取法相比，长消息的置换调用数约为其 448/512。h = c，squeeze 阶段零次置换调用。","finalTag":"末块 θ → C","finalTagNote":"按 §3.4 取 θ=0^(c−1)‖1；公开论坛指出 Algorithm 2 写成 1^c，二者给出不同摘要。注入后再保存容量。"},
    kind: "lattice",
    rows: 2,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "Wish-P · 8 条 128 位 lane",
    subtitle: "一格 = 一条 128 位 lane = 一个 AES 的 4×4 字节矩阵；L₀–L₃ 是 rate、L₄–L₇ 是 capacity，8 格合计 1024 位",
    bands: [{"from":[0,0],"to":[3,0],"label":"rate R　L₀‖L₁‖L₂‖L₃","color":"#3f85d6"},{"from":[0,1],"to":[3,1],"label":"capacity C　L₄‖L₅‖L₆‖L₇（摘要来源）","color":"#94a3b8"}],
    xTicks: ["列 0","列 1","列 2","列 3"],
    yTicks: ["rate","capacity"],
    cellNames: ["L₀","L₁","L₂","L₃","L₄","L₅","L₆","L₇"],
    unitName: "lane",
    ops: [
      { kind: "const", axis: "cells", cells: [[0,1]], cap: "AddTweak · 块计数器进 L₄", formula: "L₄ ← L₄ ⊕ τᵢ　　τᵢ = enc64(i) ‖ 0⁶⁴", note: "每个 step 都将同一块计数器注入 L₄；τᵢ = enc64(i) ‖ 0⁶⁴，只作用于 capacity 首 lane。图只显示注入位置，不画固定置位。", unitBits: 128, injSym: "⊕ τᵢ", injShort: "τ", injTitle: "τᵢ = enc64(i) ‖ 0⁶⁴，128 位" },
      { kind: "aesRound", laneCount: 8, steps: ["SubBytes","ShiftRows","MixColumns"], captions: ["16 个 AES S 盒 · DU 4 · 次数 7","行内字节循环左移 0/1/2/3","列 MDS · 分支数 5"], cap: "AESR₀ · 8 条 lane 并行", formula: "AESR = MixColumns ∘ ShiftRows ∘ SubBytes（无轮密钥）", detailTitle: "这一层完全不跨 lane", note: "Wish-512 每次置换共 8 × 2 × 9 = 144 个 AES 轮，折合每字节 2.25 个。lane 内是 AES 的 MDS 扩散（分支数 5），lane 之间此刻互不通信。", inCap: "8 条 lane 各过一次 AES 轮", depNote: "这一层完全不跨 lane" },
      { kind: "const", axis: "cells", cells: [[0,0]], cap: "AddConsts₀ · 只进 L₀", formula: "L₀ ← L₀ ⊕ Rcon[2j]", note: "Rcon[0]=0x243f6a8885a308d313198a2e03707344，后续对 16 个字节分别执行 LFSR。只注入 L₀；常数为完整的 128 位。", unitBits: 128, injTitle: "Rcon 为完整 128 位 lane；32 个十六进制字符" },
      { kind: "aesRound", laneCount: 8, steps: ["SubBytes","ShiftRows","MixColumns"], captions: ["同一组 16 个 S 盒","字节差分继续在 lane 内散","一个 step 的第 2 轮（ρ = 2）"], cap: "AESR₁ · 一个 step 的第二轮", formula: "Step_j = Mix ∘ AC_{2j+1} ∘ AESR_{2j+1} ∘ AC_{2j} ∘ AESR_{2j} ∘ AddTweak", detailTitle: "ρ = 2：每步两个 AES 轮", note: "Wish-512 的 9 个 step 合计 18 个 AES 轮，Wish-1024 的 12 个 step 合计 24 个。MILP 活跃 S 盒下界分别是 315 与 600（活跃度模型，不计差分聚类）。", inCap: "8 条 lane 各过一次 AES 轮", depNote: "ρ = 2：每个 step 两个 AES 轮" },
      { kind: "const", axis: "cells", cells: [[0,0]], cap: "AddConsts₁ · 仍只进 L₀", formula: "L₀ ← L₀ ⊕ Rcon[2j+1]", note: "Rcon[0]=0x243f6a8885a308d313198a2e03707344，后续对 16 个字节分别执行 LFSR。只注入 L₀；常数为完整的 128 位。", unitBits: 128, injTitle: "Rcon 为完整 128 位 lane；32 个十六进制字符" },
      { kind: "butterfly", lanes: 8, stages: [1,2,4], granularity: ["1 字节","2 字节","8 字节"], cap: "Mix · 纯字节交织", formula: "第 j 级配对 (i, i ⊕ 2ʲ)；Wish-512 粒度 1 B → 2 B → 8 B", detailTitle: "三级蝶形覆盖全部 8 条 lane · 一次异或都不做", note: "粒度从 4³ = 64 种组合里穷举筛出，满足 Property 4.1–4.4 的只有 12 种，取活跃 S 盒数最大者。Mix 只搬字节，lane 粒度分支数是最小值 2，跨 lane 混合全部依赖下一 step 的 MixColumns；全扩散要 2 个完整 step + 2 个 AES 轮。每级 4 对 × 2 条 unpack/zip，一次置换 216 条，为 AES 轮数的 1.5 倍。" }
    ]
  };
  S.xrh1 = {
    construction: {"kind":"sponge","midFeedforward":true,"tag":"SPONGE-EDMc · 中点前馈","permG":"XRH-p\ng = Π[0,9)","permH":"XRH-p\nh = Π[9,18)","rateBits":"r = 704 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"r′ = r，一次挤压就够","midLabel":"⊕ ⌊x⌋_c","spanLabel":"一个消息块 = 18 轮（9 + 9）","ffLabel":"橙色虚线 = 进入置换时那份 576 位容量；它在第 9 轮之后异或进容量侧。g 与 h 用互不相同的轮常数（RC[0…8] 与 RC[9…17]）。","note":"F(x) = h(g(x) ⊕ ⌊x⌋_c)，g = Π[0,9)、h = Π[9,18)。挤压阶段用完整 18 轮、不前馈、r′ = r。填充是纯 pad10*1，无域分离后缀。与 XRH-2 的差别在于这条前馈线的位置和宽度。"},
    kind: "lattice",
    rows: 4,
    cols: 5,
    xLabel: "",
    yLabel: "",
    title: "XRH-p · 4 组 × 5 行 × 64 位",
    subtitle: "一格 = 一个 64 位字（文档里的一行）= 64 个位切片列；同一组的 5 格凑成一个 5 位 AB S 盒；20 格合计 1280 位",
    xTicks: ["行 0","行 1","行 2","行 3","行 4"],
    yTicks: ["组 0","组 1","组 2","组 3"],
    cellNames: ["x0","x1","x2","x3","x4","x5","x6","x7","x8","x9","x10","x11","x12","x13","x14","x15","x16","x17","x18","x19"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "row", index: 1, width: 5, cap: "S · 5 位 Almost Bent 置换", formula: "差分均匀度 2 · max|Walsh| = 8\n位切片 25 门：AND 5 · OR 3 · NOT 1 · XOR 16", parallelNote: "× 64 个位切片列 × 4 组 = 256 个 S 盒 / 层，每轮两层共 512 个", note: "查找表 S = [4,14,10,5,9,24,20,0,18,28,30,21,2,23,29,13,22,27,15,7,26,12,16,3,8,1,19,31,25,11,17,6]（文档 §1.2.1）；差分均匀度 2 是 5 位置换可达的最优值，Walsh 谱 ⊆ {0,±8}，为 Almost Bent，各坐标代数次数 2。" },
      { kind: "columnMix", axis: "all", sym: "M", cap: "MDS · 4 个组符号混合", formula: "M = [3 2 1 3; 3 1 4 4; 1 3 6 4; 2 2 3 1]\nF₂⁵ = F₂[x]/(x⁵+x²+1)　分支数 5", detailTitle: "一个位切片列上的 4 个 5 比特组符号过一次 MDS，64 列并行", detail: "固定 z 切片上 4 个 GF(2⁵) 符号混合，每个符号由同组五字的同一位组成。符号级分支数 5；比特级依赖由矩阵稀疏展开，并非每个输出比特都依赖全部 20 位。", note: "文档给出该 MDS 为 44 个 XOR 门。乘 x 按 x⁵ = x² + 1 约简：t0′=t4, t1′=t0, t2′=t1⊕t4, t3′=t2, t4′=t3。分支数 5 是文档 MILP 活跃 S 盒下界的基础。", inCap: "同一组 5 行的 5 个字按比特位凑成 GF(2⁵) 符号，4 个组符号进一次 MDS", depNote: "四个输入符号均参与；单比特依赖稀疏" },
      { kind: "sbox", axis: "row", index: 2, width: 5, cap: "S · 第二层，合成 Super S-box", formula: "S′ = S^⊗4 ∘ M ∘ S^⊗4\n每列 20 比特上的 Super S-box", parallelNote: "× 64 个位切片列 × 4 组 = 256 个 S 盒；一轮里的第二层", note: "同一个 AB S 盒再作用一次，与前一步的 MDS 合成每列 20 比特上的 Super S-box，相当于把 AES 宽轨三件套整体提升一层。每轮因此有两层非线性，共 512 个 S 盒实例。" },
      { kind: "bitShuffle", bitsShown: 16, marks: [0,1,2,3], cap: "ShiftRows · 字内位级移位", formula: "移位量只取决于组号 ⌊i/5⌋，第 0 组不动\n示意：SR_Y 在组 1 上的 16 位组内移 4 位", detailTitle: "三型 ShiftRows 按轮号 r mod 3 轮换，分组尺度 4 / 16 / 64", note: "SR_X：64 列分 16 组 × 4 列，组内移 ⌊i/5⌋ 位，位级写法为 ((x&0x7777…)<<1)|((x&0x8888…)>>3)，即 2 次 AND、2 次移位、1 次 OR。SR_Y：4 组 × 16 列，移 4⌊i/5⌋。SR_Z：整个 64 位字旋转 16⌊i/5⌋。", variants: "SR_X / SR_Y 需要掩码、移位与拼接，SR_Z 只是整字旋转；硬件上三者都是布线、0 GE。按轮号 r mod 3 轮换，扩散尺度在 4、16、64 位之间交替。", map: function (i) { return (i+4)%16; } },
      { kind: "columnMix", axis: "all", sym: "M′", cap: "MDS · 与 SR 共轭成 Super MixColumn", formula: "M′ = SR⁻¹ ∘ M ∘ SR\n同一个矩阵，靠共轭跨 Super S-box 混合", detailTitle: "第二次 MDS：把混合从一个 Super S-box 内部扩展到相邻 4 个之间", detail: "固定 z 切片上 4 个 GF(2⁵) 符号混合，每个符号由同组五字的同一位组成。符号级分支数 5；比特级依赖由矩阵稀疏展开，并非每个输出比特都依赖全部 20 位。", note: "一轮两次 MDS，共用同一矩阵。M 的转置仍是 MDS，所以线性分支数同样是 5。文档 MILP 给出 1–8 轮最小活跃 S 盒数为 5 / 25 / 45 / 125 / 205 / ≤300 / ≤320 / >320。", inCap: "同一组 5 行的 5 个字按比特位凑成 GF(2⁵) 符号，4 个组符号进一次 MDS", depNote: "四个输入符号均参与；单比特依赖稀疏" },
      { kind: "const", at: [0,0], cap: "SR⁻¹ 复位 + 轮常数", formula: "x₀ ← x₀ ⊕ RC_r\nRC₀ = 0x243F6A8885A308D3", bits: [0,1,4,6,7,11,16,17,21,23,24,26,31,35,39,41,43,45,46,48,49,50,51,52,53,58,61], note: "先执行 SR⁻¹，再把 RCᵣ 异或到 x₀。图中只表示首常数 0x243F6A8885A308D3 的 27 个置位；后续轮使用各自 RC。", passNote: "同一步里的 SR⁻¹ 还要改 x5…x19 共 15 个字", bitIndexOrder: "lsb-first", injTitle: "RC₀ 真实 27 个置位；bit 0 为最低位" }
    ]
  };
  S.xrh2 = {
    construction: {"kind":"sponge","feedforward":true,"tag":"SPONGE-DM · 全状态前馈","perm":"XRH-p\n1280 位 · 18 轮","rateBits":"r = 704 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"r′ = r，一次挤压就够","ffLabel":"完整 18 轮之后，把整个 1280 位旧状态异或回来","note":"F(x) = f(x) ⊕ x。原语与 XRH-1 相同，差别在这条前馈线：DM 在 18 轮之后对整个状态前馈，硬件要多存 1280 位；XRH-1 的 EDMc 只存 576 位容量，但要把置换拆成两段调用。","ffScope":"full"},
    kind: "lattice",
    rows: 4,
    cols: 5,
    xLabel: "",
    yLabel: "",
    title: "XRH-p · 4 组 × 5 行 × 64 位",
    subtitle: "一格 = 一个 64 位字（文档里的一行）；20 个字分 4 组、每组 5 行，同组 5 格按比特位凑成一个 5 位 AB S 盒的输入；置换与 XRH-1 相同",
    xTicks: ["行 0","行 1","行 2","行 3","行 4"],
    yTicks: ["组 0","组 1","组 2","组 3"],
    cellNames: ["x0","x1","x2","x3","x4","x5","x6","x7","x8","x9","x10","x11","x12","x13","x14","x15","x16","x17","x18","x19"],
    unitName: "字",
    ops: [
      { kind: "sbox", axis: "row", index: 1, width: 5, cap: "S · 5 位 Almost Bent 置换", formula: "差分均匀度 2 · max|Walsh| = 8\n位切片 25 门：AND 5 · OR 3 · NOT 1 · XOR 16", parallelNote: "× 64 个位切片列 × 4 组 = 256 个 S 盒 / 层，每轮两层共 512 个", note: "查找表 S = [4,14,10,5,9,24,20,0,18,28,30,21,2,23,29,13,22,27,15,7,26,12,16,3,8,1,19,31,25,11,17,6]（文档 §1.2.1）；差分均匀度 2 是 5 位置换可达的最优值，Walsh 谱 ⊆ {0,±8}，为 Almost Bent，各坐标代数次数 2。" },
      { kind: "columnMix", axis: "all", sym: "M", cap: "MDS · 4 个组符号混合", formula: "M = [3 2 1 3; 3 1 4 4; 1 3 6 4; 2 2 3 1]\nF₂⁵ = F₂[x]/(x⁵+x²+1)　分支数 5", detailTitle: "一个位切片列上的 4 个 5 比特组符号过一次 MDS，64 列并行", detail: "固定 z 切片上 4 个 GF(2⁵) 符号混合，每个符号由同组五字的同一位组成。符号级分支数 5；比特级依赖由矩阵稀疏展开，并非每个输出比特都依赖全部 20 位。", note: "文档给出该 MDS 为 44 个 XOR 门。乘 x 按 x⁵ = x² + 1 约简：t0′=t4, t1′=t0, t2′=t1⊕t4, t3′=t2, t4′=t3。分支数 5 是文档 MILP 活跃 S 盒下界的基础。", inCap: "同一组 5 行的 5 个字按比特位凑成 GF(2⁵) 符号，4 个组符号进一次 MDS", depNote: "四个输入符号均参与；单比特依赖稀疏" },
      { kind: "sbox", axis: "row", index: 2, width: 5, cap: "S · 第二层，合成 Super S-box", formula: "S′ = S^⊗4 ∘ M ∘ S^⊗4\n每列 20 比特上的 Super S-box", parallelNote: "× 64 个位切片列 × 4 组 = 256 个 S 盒；一轮里的第二层", note: "同一个 AB S 盒再作用一次，与前一步的 MDS 合成每列 20 比特上的 Super S-box，相当于把 AES 宽轨三件套整体提升一层。每轮因此有两层非线性，共 512 个 S 盒实例。" },
      { kind: "bitShuffle", bitsShown: 16, marks: [0,1,2,3], cap: "ShiftRows · 字内位级移位", formula: "移位量只取决于组号 ⌊i/5⌋，第 0 组不动\n示意：SR_Y 在组 1 上的 16 位组内移 4 位", detailTitle: "三型 ShiftRows 按轮号 r mod 3 轮换，分组尺度 4 / 16 / 64", note: "SR_X：64 列分 16 组 × 4 列，组内移 ⌊i/5⌋ 位，位级写法为 ((x&0x7777…)<<1)|((x&0x8888…)>>3)，即 2 次 AND、2 次移位、1 次 OR。SR_Y：4 组 × 16 列，移 4⌊i/5⌋。SR_Z：整个 64 位字旋转 16⌊i/5⌋。", variants: "SR_X / SR_Y 需要掩码、移位与拼接，SR_Z 只是整字旋转；硬件上三者都是布线、0 GE。按轮号 r mod 3 轮换，扩散尺度在 4、16、64 位之间交替。", map: function (i) { return (i+4)%16; } },
      { kind: "columnMix", axis: "all", sym: "M′", cap: "MDS · 与 SR 共轭成 Super MixColumn", formula: "M′ = SR⁻¹ ∘ M ∘ SR\n同一个矩阵，靠共轭跨 Super S-box 混合", detailTitle: "第二次 MDS：把混合从一个 Super S-box 内部扩展到相邻 4 个之间", detail: "固定 z 切片上 4 个 GF(2⁵) 符号混合，每个符号由同组五字的同一位组成。符号级分支数 5；比特级依赖由矩阵稀疏展开，并非每个输出比特都依赖全部 20 位。", note: "一轮两次 MDS，共用同一矩阵。M 的转置仍是 MDS，所以线性分支数同样是 5。文档 MILP 给出 1–8 轮最小活跃 S 盒数为 5 / 25 / 45 / 125 / 205 / ≤300 / ≤320 / >320。", inCap: "同一组 5 行的 5 个字按比特位凑成 GF(2⁵) 符号，4 个组符号进一次 MDS", depNote: "四个输入符号均参与；单比特依赖稀疏" },
      { kind: "const", at: [0,0], cap: "SR⁻¹ 复位 + 轮常数", formula: "x₀ ← x₀ ⊕ RC_r\nRC₀ = 0x243F6A8885A308D3", bits: [0,1,4,6,7,11,16,17,21,23,24,26,31,35,39,41,43,45,46,48,49,50,51,52,53,58,61], note: "先执行 SR⁻¹，再把 RCᵣ 异或到 x₀。图中只表示首常数 0x243F6A8885A308D3 的 27 个置位；后续轮使用各自 RC。", passNote: "同一步里的 SR⁻¹ 还要改 x5…x19 共 15 个字", bitIndexOrder: "lsb-first", injTitle: "RC₀ 真实 27 个置位；bit 0 为最低位" }
    ]
  };
  S.zcdm = {
    construction: {"kind":"sponge","feedforward":true,"tag":"SPONGE-DM · 全状态前馈","perm":"ZuD-1280\n1280 位 · 12 轮","rateBits":"r = 704 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"r′ = r，一次挤压就够","ffLabel":"置换前存下全部 1280 位，置换后整体异或回来","note":"F(x) = f(x) ⊕ x。填充是 msg‖01 再 pad10*1，MSB-first；无独立终止化，最后一块的吸收本身就是终止化；挤压阶段用裸置换、不前馈。三个 ZC 变体的差别全在这条前馈线：DM 前馈整个 1280 位状态，DMc 只前馈 576 位容量并把挤压速率压到 64 位，EDMc 把置换拆成 6 + 6、在中点前馈容量。","ffScope":"full"},
    kind: "lattice",
    rows: 5,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "ZuD-1280 · 5 个平面 × 4 条 lane",
    subtitle: "一格 = 一条 64 位 lane = 一个 uint64_t；同一列 x 上的 5 格凑成一个 5 位 χ；20 格合计 1280 位",
    xTicks: ["x = 0","x = 1","x = 2","x = 3"],
    yTicks: ["A0","A1","A2","A3","A4"],
    cellNames: ["A0[0]","A0[1]","A0[2]","A0[3]","A1[0]","A1[1]","A1[2]","A1[3]","A2[0]","A2[1]","A2[2]","A2[3]","A3[0]","A3[1]","A3[2]","A3[3]","A4[0]","A4[1]","A4[2]","A4[3]"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], cap: "轮常数只进 A0[0]", formula: "A0[0] ← A0[0] ⊕ RCᵢ\nRC₀ = 0x058　RC₂ = 0x3C0（最大值）", bits: [1,2,3,4,5,6,7,8,9], note: "RC = 058,038,3C0,0D0,120,014,060,02C,380,0F0,1A0,012。图中表示全部常数可能置位的位置；不表示每个常数都在这些位置取 1。", injTitle: "12 个 RC 的置位并集：bit 1…9；bit 0 与 bit 10…63 均为零", unitBits: 64, bitIndexOrder: "lsb-first" },
      { kind: "sbox", axis: "column", index: 1, width: 5, cap: "χ · 列内 5 位非线性", formula: "bᵢ = aᵢ ⊕ (¬aᵢ₊₁ ∧ aᵢ₊₂)　i ∈ Z₅", parallelNote: "× 64 个 z 切片 × 4 列 = 256 个并行 5 位 χ / 轮", note: "整层就是 5 平面 × 4 lane × (ANDNOT + XOR) = 40 个 64 位字操作，是一轮里唯一的非线性来源。χ₅ 的代数次数 2、最大差分概率 2⁻²、最大线性偏差 2⁻²，差分与线性分支数均为 2。" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 2, cap: "ρ · 平面移位 + lane 内旋转", formula: "A1 ≪ (1,5)　A2 ≪ (3,24)\nA3 ≪ (0,1)　A4 ≪ (2,3)　A0 不动", note: "按文档 A_y[x,z] ← A_y[x−a,z−b]：原位置 x 送到 (x+a) mod 4，屏幕上为向右移；字内为 ROTL64(b)。两次 ρ 使用同组偏移。", dir: "right" },
      { kind: "parity", index: 2, cap: "θ · 列奇偶，注入量来自前一列", formula: "P[x] = A0[x] ⊕ … ⊕ A4[x]\nE[x] = ROTL(P[x−1],5) ⊕ ROTL(P[x−1],14)\nA_y[x] ← A_y[x] ⊕ E[x]", p: "P[x] 本列奇偶", q: "E[x] 由前一列生成", note: "16 次异或算出 4 个列奇偶，4 列 × (2 次旋转 + 1 次异或) 生成注入量，再 20 次异或加回 5 个平面。x 方向只推进 1 格（E[x] 只依赖 P[x−1]），走遍 4 个 sheet 需要 4 次 θ。ZC-1536 的旋转量是 20 / 56。", inCap: "第 2 列的 5 条 lane 先求本列奇偶 P[x]", injScope: "E[x] 由前一列的 P[x−1] 生成，只注入本列 5 条 lane", depNote: "x 方向每轮只推进 1 格，不是一步传到全状态", detailTitle: "θ：注入量来自前一列", detail: "E[x] = P[x−1]⋘5 ⊕ P[x−1]⋘14，因此扩散沿 x 方向每轮只前进一格，需多轮才能覆盖全部列。", srcIndex: 1, srcLabel: "E[x] 由前一列的 P[x−1] 生成" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 4, cap: "ρ · 第二次，同一组偏移", formula: "一轮顺序：ι → χ → ρ → θ → ρ\n两次 ρ 使用同一组偏移", note: "按文档 A_y[x,z] ← A_y[x−a,z−b]：原位置 x 送到 (x+a) mod 4，屏幕上为向右移；字内为 ROTL64(b)。两次 ρ 使用同组偏移。", dir: "right" }
    ]
  };
  S.zcdmc = {
    construction: {"kind":"sponge","feedforward":true,"tag":"SPONGE-DMc · IV 实例标签","perm":"ZuD-1280\n1280 位 · 12 轮","rateBits":"r = 704 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"r′ = 64，挤出 8 次（额外 7 次置换）","ffLabel":"置换后只把输入的 576 位容量异或回来","note":"F(X)=ZC-b(X)⊕(0^r‖X_c)，仅吸收时容量前馈。新版 IV 末三位为 001/010/100（摘要 512/768/1024）；固定 c=n+64、r′=64，所有消息长度均用同组参数。填充仍按 Algorithm 3 为 M‖01‖1‖0^j‖1。挤出只调用裸置换，不重复容量前馈；512/768/1024 分别多调用 7/11/15 次。","ivLabel":"IV = 0^(b−3)‖dₙ；d₅₁₂ = 001"},
    kind: "lattice",
    rows: 5,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "ZuD-1280 · 5 个平面 × 4 条 lane",
    subtitle: "一格 = 一条 64 位 lane = 一个 uint64_t；同一列 x 上的 5 格凑成一个 5 位 χ；20 格合计 1280 位（与 ZC-DM 同一个置换）",
    xTicks: ["x = 0","x = 1","x = 2","x = 3"],
    yTicks: ["A0","A1","A2","A3","A4"],
    cellNames: ["A0[0]","A0[1]","A0[2]","A0[3]","A1[0]","A1[1]","A1[2]","A1[3]","A2[0]","A2[1]","A2[2]","A2[3]","A3[0]","A3[1]","A3[2]","A3[3]","A4[0]","A4[1]","A4[2]","A4[3]"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], cap: "轮常数只进 A0[0]", formula: "A0[0] ← A0[0] ⊕ RCᵢ\nRC₀ = 0x058　RC₂ = 0x3C0（最大值）", bits: [1,2,3,4,5,6,7,8,9], note: "RC = 058,038,3C0,0D0,120,014,060,02C,380,0F0,1A0,012。图中表示全部常数可能置位的位置；不表示每个常数都在这些位置取 1。", injTitle: "12 个 RC 的置位并集：bit 1…9；bit 0 与 bit 10…63 均为零", unitBits: 64, bitIndexOrder: "lsb-first" },
      { kind: "sbox", axis: "column", index: 1, width: 5, cap: "χ · 列内 5 位非线性", formula: "bᵢ = aᵢ ⊕ (¬aᵢ₊₁ ∧ aᵢ₊₂)　i ∈ Z₅", parallelNote: "× 64 个 z 切片 × 4 列 = 256 个并行 5 位 χ / 轮", note: "整层就是 5 平面 × 4 lane × (ANDNOT + XOR) = 40 个 64 位字操作，是一轮里唯一的非线性来源。χ₅ 的代数次数 2、最大差分概率 2⁻²、最大线性偏差 2⁻²，差分与线性分支数均为 2。" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 2, cap: "ρ · 平面移位 + lane 内旋转", formula: "A1 ≪ (1,5)　A2 ≪ (3,24)\nA3 ≪ (0,1)　A4 ≪ (2,3)　A0 不动", note: "按文档 A_y[x,z] ← A_y[x−a,z−b]：原位置 x 送到 (x+a) mod 4，屏幕上为向右移；字内为 ROTL64(b)。两次 ρ 使用同组偏移。", dir: "right" },
      { kind: "parity", index: 2, cap: "θ · 列奇偶，注入量来自前一列", formula: "P[x] = A0[x] ⊕ … ⊕ A4[x]\nE[x] = ROTL(P[x−1],5) ⊕ ROTL(P[x−1],14)\nA_y[x] ← A_y[x] ⊕ E[x]", p: "P[x] 本列奇偶", q: "E[x] 由前一列生成", note: "16 次异或算出 4 个列奇偶，4 列 × (2 次旋转 + 1 次异或) 生成注入量，再 20 次异或加回 5 个平面。x 方向只推进 1 格（E[x] 只依赖 P[x−1]），走遍 4 个 sheet 需要 4 次 θ。ZC-1536 的旋转量是 20 / 56。", inCap: "第 2 列的 5 条 lane 先求本列奇偶 P[x]", injScope: "E[x] 由前一列的 P[x−1] 生成，只注入本列 5 条 lane", depNote: "x 方向每轮只推进 1 格，不是一步传到全状态", detailTitle: "θ：注入量来自前一列", detail: "E[x] = P[x−1]⋘5 ⊕ P[x−1]⋘14，因此扩散沿 x 方向每轮只前进一格，需多轮才能覆盖全部列。", srcIndex: 1, srcLabel: "E[x] 由前一列的 P[x−1] 生成" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 4, cap: "ρ · 第二次，同一组偏移", formula: "一轮顺序：ι → χ → ρ → θ → ρ\n两次 ρ 使用同一组偏移", note: "按文档 A_y[x,z] ← A_y[x−a,z−b]：原位置 x 送到 (x+a) mod 4，屏幕上为向右移；字内为 ROTL64(b)。两次 ρ 使用同组偏移。", dir: "right" }
    ]
  };
  S.zcedmc = {
    construction: {"kind":"sponge","midFeedforward":true,"tag":"提交实现：ĥ → 容量前馈 → ĥ","permG":"提交代码 ĥ\n后 6 轮","permH":"提交代码 ĥ\n后 6 轮","rateBits":"r = 704 bit","capBits":"c = 576 bit","capName":"capacity","outFrom":"rate","outLabel":"摘要 512 bit","outSub":"r′ = r，一次挤压就够","midLabel":"⊕ (0ʳ ‖ ⌊x⌋_c)","spanLabel":"一个消息块 = 12 轮（6 + 6）","ffLabel":"橙色虚线 = 进入置换时那份 576 位容量；它在第 6 轮之后异或进容量侧。","note":"公开论坛报告：文档主公式与提交实现均为 F(X)=h(h(X)⊕(0^r‖X_c))，Algorithm 3 注释为 h∘g；代码轮常数次序与文档常数表亦有差异。图示按提交实现绘制，两个半程都用后六轮代码常数。挤出使用完整 12 轮裸置换。"},
    kind: "lattice",
    rows: 5,
    cols: 4,
    xLabel: "",
    yLabel: "",
    title: "ZuD-1280 · 5 个平面 × 4 条 lane",
    subtitle: "一格 = 一条 64 位 lane = 一个 uint64_t；同一列 x 上的 5 格凑成一个 5 位 χ；20 格合计 1280 位（吸收时分两个 6 轮半程）（与 ZC-DM 同一个置换）",
    xTicks: ["x = 0","x = 1","x = 2","x = 3"],
    yTicks: ["A0","A1","A2","A3","A4"],
    cellNames: ["A0[0]","A0[1]","A0[2]","A0[3]","A1[0]","A1[1]","A1[2]","A1[3]","A2[0]","A2[1]","A2[2]","A2[3]","A3[0]","A3[1]","A3[2]","A3[3]","A4[0]","A4[1]","A4[2]","A4[3]"],
    unitName: "lane",
    ops: [
      { kind: "const", at: [0,0], cap: "轮常数只进 A0[0]", formula: "A0[0] ← A0[0] ⊕ RCᵢ\nRC₀ = 0x058　RC₂ = 0x3C0（最大值）", bits: [1,2,3,4,5,6,7,8,9], note: "公开论坛报告：提交实现的两个半程均调用后六轮，代码轮常数次序与文档常数表在第 4、5、6、8、9、10 轮不同。图示按提交实现绘制。", injTitle: "RC 置位并集 bit 1…9；轮序以声明的路径为准", bitIndexOrder: "lsb-first" },
      { kind: "sbox", axis: "column", index: 1, width: 5, cap: "χ · 列内 5 位非线性", formula: "bᵢ = aᵢ ⊕ (¬aᵢ₊₁ ∧ aᵢ₊₂)　i ∈ Z₅", parallelNote: "× 64 个 z 切片 × 4 列 = 256 个并行 5 位 χ / 轮", note: "整层就是 5 平面 × 4 lane × (ANDNOT + XOR) = 40 个 64 位字操作，是一轮里唯一的非线性来源。χ₅ 的代数次数 2、最大差分概率 2⁻²、最大线性偏差 2⁻²，差分与线性分支数均为 2。" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 2, cap: "ρ · 平面移位 + lane 内旋转", formula: "A1 ≪ (1,5)　A2 ≪ (3,24)\nA3 ≪ (0,1)　A4 ≪ (2,3)　A0 不动", note: "A_y[x,z]←A_y[x−a,z−b]，原位置 x 送到 x+a；屏幕向右移动，lane 内 ROTL64。", dir: "right" },
      { kind: "parity", index: 2, cap: "θ · 列奇偶，注入量来自前一列", formula: "P[x] = A0[x] ⊕ … ⊕ A4[x]\nE[x] = ROTL(P[x−1],5) ⊕ ROTL(P[x−1],14)\nA_y[x] ← A_y[x] ⊕ E[x]", p: "P[x] 本列奇偶", q: "E[x] 由前一列生成", note: "16 次异或算出 4 个列奇偶，4 列 × (2 次旋转 + 1 次异或) 生成注入量，再 20 次异或加回 5 个平面。x 方向只推进 1 格（E[x] 只依赖 P[x−1]），走遍 4 个 sheet 需要 4 次 θ。ZC-1536 的旋转量是 20 / 56。", inCap: "第 2 列的 5 条 lane 先求本列奇偶 P[x]", injScope: "E[x] 由前一列的 P[x−1] 生成，只注入本列 5 条 lane", depNote: "x 方向每轮只推进 1 格，不是一步传到全状态", detailTitle: "θ：注入量来自前一列", detail: "E[x] = P[x−1]⋘5 ⊕ P[x−1]⋘14，因此扩散沿 x 方向每轮只前进一格，需多轮才能覆盖全部列。", srcIndex: 1, srcLabel: "E[x] 由前一列的 P[x−1] 生成" },
      { kind: "laneShift", axis: "row", unitName: "平面", amount: function (i) { return [0,1,3,0,2][i]; }, rot: function (i) { return [0,5,24,1,3][i]; }, sample: 4, cap: "ρ · 第二次，同一组偏移", formula: "一轮顺序：ι → χ → ρ → θ → ρ\n两次 ρ 使用同一组偏移", note: "A_y[x,z]←A_y[x−a,z−b]，原位置 x 送到 x+a；屏幕向右移动，lane 内 ROTL64。", dir: "right" }
    ]
  };
})();
