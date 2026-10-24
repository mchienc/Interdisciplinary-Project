import React, { useState } from 'react';
import { 
  X, 
  Binary, 
  Compass, 
  MapPin, 
  Route, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmModal: React.FC<AlgorithmModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'weiszfeld' | 'kmeans' | 'tsp' | 'postgis'>('weiszfeld');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C382B] text-white flex items-center justify-center shadow-sm">
              <Binary className="w-5 h-5 text-[#B85D3B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B85D3B]/10 text-[#B85D3B]">
                  HỘI ĐỒNG KHOA HỌC &amp; CHUYÊN GIA GIS
                </span>
                <span className="text-xs text-stone-400 font-sans">SDSS v2.0</span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C382B] mt-0.5">
                Cơ Sở Thuật Toán &amp; Mô Hình Toán Học
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-200 border border-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-white border-b border-stone-200/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('weiszfeld')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weiszfeld'
                ? 'bg-[#1C382B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span>1. Trung Vị Weiszfeld (L1)</span>
          </button>

          <button
            onClick={() => setActiveTab('kmeans')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kmeans'
                ? 'bg-[#1C382B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>2. Cân Bằng Cụm K-Means</span>
          </button>

          <button
            onClick={() => setActiveTab('tsp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tsp'
                ? 'bg-[#1C382B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-[#2A6F68]" />
            <span>3. OR-Tools TSP Vòng Kín</span>
          </button>

          <button
            onClick={() => setActiveTab('postgis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'postgis'
                ? 'bg-[#1C382B] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#D97706]" />
            <span>4. PostGIS &amp; Đa Tiêu Chí</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-700 leading-relaxed font-sans text-xs sm:text-sm">
          
          {/* TAB 1: WEISZFELD */}
          {activeTab === 'weiszfeld' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#B85D3B] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <b>Bài toán vị trí (Fermat-Weber Facility Location Problem):</b> Xác định tọa độ khách sạn lý tưởng $H(x, y)$ sao cho <b>tổng quãng đường di chuyển Euclidean</b> từ $H$ tới toàn bộ tập hợp $N$ điểm tham quan $P_1, P_2, \dots, P_N$ đạt cực tiểu.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">1. Hàm mục tiêu tối ưu hóa ($L_1$-norm):</h4>
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 font-mono text-center text-xs text-[#1C382B] shadow-2xs">
                  min<sub>H</sub> &Sigma; ||H - P<sub>i</sub>||<sub>2</sub> = min<sub>(x,y)</sub> &Sigma; &radic;((x - x<sub>i</sub>)&sup2; + (y - y<sub>i</sub>)&sup2;)
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">2. Công thức lặp Weiszfeld (Iterative Reweighted Least Squares):</h4>
                <p className="text-xs text-stone-600">
                  Tại mỗi bước lặp <i>t</i>, tọa độ H<sup>(t+1)</sup> được cập nhật theo trung bình có trọng số nghịch đảo khoảng cách:
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 font-mono text-center text-xs text-[#1C382B] shadow-2xs">
                  H<sup>(t+1)</sup> = [ &Sigma; (P<sub>i</sub> / (||H<sup>(t)</sup> - P<sub>i</sub>|| + &epsilon;)) ] &divide; [ &Sigma; (1 / (||H<sup>(t)</sup> - P<sub>i</sub>|| + &epsilon;)) ]
                </div>
                <p className="text-[11px] text-stone-500 italic">
                  Trong đó &epsilon; = 10<sup>-6</sup> là hệ số ổn định số học tránh phép chia cho 0 khi nghiệm trùng với một POI. Thuật toán dừng khi ||H<sup>(t+1)</sup> - H<sup>(t)</sup>|| &lt; 10<sup>-4</sup> mét hoặc đạt 150 bước lặp.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">3. Ưu thế học thuật so với Trọng tâm số học (Arithmetic Centroid):</h4>
                <ul className="space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Kháng ngoại lai vượt trội (Robust Spatial Estimator):</b> Trọng tâm số học tối thiểu hóa $L_2^2$ (bình phương khoảng cách), rất nhạy cảm với các điểm du lịch xa trung tâm (như Chùa Hương hay Ba Vì), làm lệch vị trí khách sạn ra đồng ruộng ngoại ô. Weiszfeld $L_1$-norm luôn neo vị trí lưu trú tại vùng có mật độ di tích dày đặc nhất.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><b>Chuyển đổi hệ tọa độ chuẩn xác:</b> Toàn bộ tọa độ WGS84 (EPSG:4326) được chuyển đổi sang hệ phẳng chiếu mét <b>UTM Zone 49N (EPSG:32649)</b> trước khi tính toán để triệt tiêu biến dạng mặt cầu tại vĩ độ Hà Nội.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: K-MEANS & HUNGARIAN */}
          {activeTab === 'kmeans' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <b>Bài toán gom cụm ngày cân bằng (Capacity-Constrained Clustering):</b> Phân chia $N$ điểm tham quan thành $K$ ngày du lịch sao cho các điểm trong cùng một ngày gần nhau nhất về địa lý, đồng thời <b>số lượng điểm mỗi ngày luôn đồng đều</b> (chênh lệch tối đa 1 điểm giữa các ngày).
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">1. Khắc phục nhược điểm của K-Means truyền thống:</h4>
                <p className="text-xs text-stone-600">
                  K-Means thông thường chỉ tối ưu khoảng cách cụm mà không khống chế dung lượng, dẫn đến tình trạng mất cân bằng nghiêm trọng (ví dụ: Ngày 1 dồn 7 điểm, Ngày 2 chỉ có 1 điểm). SDSS khắc phục bằng thuật toán ghép cặp hai phía (Bipartite Matching):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <b className="text-stone-800">Dung lượng cân bằng:</b>
                    <p className="text-stone-600 mt-1">Mỗi ngày nhận $\lfloor N/K \rfloor$ hoặc $\lceil N/K \rceil$ vị trí (slots). Tổng dung lượng $K$ ngày đúng bằng $N$.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <b className="text-stone-800">Thuật toán Hungarian:</b>
                    <p className="text-stone-600 mt-1">Giải bài toán gán Linear Sum Assignment với ma trận chi phí khoảng cách Euclidean giữa $N$ điểm và trọng tâm các ngày.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">2. Chuỗi tuần tự logic theo trục Tây - Đông:</h4>
                <p className="text-xs text-stone-600">
                  Sau khi phân cụm, các ngày du lịch được tự động sắp xếp theo tọa độ tâm $X$ (từ Tây sang Đông). Điều này tạo nên lịch trình mạch lạc, giúp du khách chuyển vùng khám phá một cách tự nhiên (ví dụ: Ngày 1 Cụm Ba Đình - Tây Hồ $\to$ Ngày 2 Cụm Hoàn Kiếm - Phố Cổ).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: OR-TOOLS TSP */}
          {activeTab === 'tsp' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-teal-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#2A6F68] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <b>Bài toán Người du lịch (Travelling Salesperson Problem - TSP Vòng kín):</b> Xuất phát từ Khách sạn lưu trú (Nút Depot $0$), ghé thăm tất cả các điểm đến trong ngày đúng 1 lần và quay trở về khách sạn với <b>tổng thời gian hoặc cự ly di chuyển là nhỏ nhất</b>.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">1. Mô hình giải thuật Google OR-Tools:</h4>
                <ul className="space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
                    <span><b>First Solution Strategy:</b> <code>PATH_CHEAPEST_ARC</code> — Xây dựng nghiệm ban đầu bằng cách liên tục nối các cung có chi phí thời gian thấp nhất.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
                    <span><b>Local Search Metaheuristic:</b> <code>GUIDED_LOCAL_SEARCH</code> — Tìm kiếm cục bộ có hướng dẫn, tự động vượt qua các bẫy cực tiểu địa phương (Local Minima) để tiệm cận lời giải tối ưu toàn cục.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
                    <span><b>Closed-loop Round Trip:</b> Lộ trình luôn khép kín $0 \to p_1 \to p_2 \to \dots \to p_k \to 0$, tính toán đủ chi phí chặng về khách sạn.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">2. Tối ưu hướng di chuyển theo Nhịp sinh học Hà Nội:</h4>
                <p className="text-xs text-stone-600">
                  Do tính chất vòng kín của TSP, thứ tự thuận $0 \to p_1 \to \dots \to p_k \to 0$ và thứ tự đảo $0 \to p_k \to \dots \to p_1 \to 0$ có tổng chi phí di chuyển tương đương nhau. SDSS chấm điểm hướng di chuyển để:
                </p>
                <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-700">
                  ✦ Điểm di tích lịch sử ngoài trời / lăng viếng ưu tiên ghé vào <b>buổi sáng thanh khiết</b>.<br />
                  ✦ Điểm ngắm cảnh hồ, cà phê, phố đi bộ và ẩm thực chợ đêm ưu tiên nằm ở <b>buổi xế chiều &amp; tối</b>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POSTGIS & MULTI-CRITERIA */}
          {activeTab === 'postgis' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <b>Truy vấn Không gian PostGIS &amp; Đánh giá Đa tiêu chí:</b> Lọc các cơ sở lưu trú xung quanh tâm trung vị và xếp hạng Top 5 bằng Hàm đánh giá kết hợp Cự ly, Hạng sao và Giá phòng.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">1. Truy vấn không gian PostGIS ST_DWithin:</h4>
                <div className="p-3 rounded-xl bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto">
                  <code>
                    SELECT id, name, stars, rating, price_per_night,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ST_Distance(geom::geography, point_median) AS dist_m<br />
                    FROM accommodations<br />
                    WHERE ST_DWithin(geom::geography, point_median, :radius)<br />
                    ORDER BY dist_m ASC LIMIT 20;
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">2. Hàm đánh giá đa tiêu chí (Multi-criteria Evaluation):</h4>
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 font-mono text-center text-xs text-[#1C382B] shadow-2xs">
                  Điểm = w<sub>dist</sub> &times; Norm(dist) + w<sub>rating</sub> &times; Norm(rating) - w<sub>price</sub> &times; Norm(price)
                </div>
                <p className="text-xs text-stone-600">
                  Chuẩn hóa Min-Max đảm bảo các tiêu chí có thứ nguyên khác nhau (mét, điểm sao, VNĐ) đều quy về thang đo tương thích [0, 100] trước khi tổng hợp.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="font-serif font-bold text-sm text-[#1C382B]">3. Cơ chế thích ứng bán kính (Adaptive Spatial Buffer):</h4>
                <p className="text-xs text-stone-600">
                  Khi người dùng chọn các điểm ngoại thành cách xa nhau (khoảng cách &gt; 50 km), hệ thống tự động nới lỏng bán kính theo cơ chế lũy tiến từ 4 km $\to$ 12 km $\to$ 25 km kết hợp KNN Index-assisted Operator (<code>geom &lt;-&gt; point</code>), đảm bảo không bao giờ xảy ra lỗi rỗng kết quả (Zero 404 Exceptions).
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans">
            <Award className="w-4 h-4 text-[#B85D3B]" />
            <span>Đồ án Nghiên cứu Liên ngành Công nghệ Thông tin &amp; Hệ thống Thông tin Địa lý (GIS)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
