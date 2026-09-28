# 📱 Kế Hoạch Flutter: Implement Stock Token Mobile App

## Mục tiêu
Chuyển đổi toàn bộ giao diện user từ Next.js (React) sang Flutter mobile, đồng thời học sâu Flutter để chuẩn bị phỏng vấn xin việc.

> [!IMPORTANT]
> Kế hoạch này được thiết kế để **vừa học vừa làm** — mỗi kiến thức Flutter được gắn liền với một phần implement cụ thể của Stock Token app. Sau khi hoàn thành, bạn sẽ có cả **project portfolio** lẫn **kiến thức phỏng vấn**.

---

## 📊 Tổng quan codebase hiện tại (Next.js)

### Cấu trúc màn hình cần implement

| # | Màn hình | File gốc | Mức độ phức tạp | Widget chính Flutter |
|---|----------|----------|-----------------|---------------------|
| 1 | **Dashboard** | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/dashboard/page.tsx) | ⭐⭐ | Card, ListView, Chart |
| 2 | **Trade** (Mua/Bán) | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/trade/page.tsx) | ⭐⭐⭐ | TabBar, Form, Async |
| 3 | **Wallet** (Ví tiền) | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/wallet/page.tsx) | ⭐⭐⭐⭐ | Nested Tabs, Forms |
| 4 | **History** (Lịch sử) | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/history/page.tsx) | ⭐⭐ | ListView, Filter |
| 5 | **Profile** (Cá nhân) | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/profile/page.tsx) | ⭐⭐ | ListTile, Navigation |
| 6 | **KYC** (Xác minh) | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/kyc/page.tsx) | ⭐⭐⭐⭐ | Stepper, ImagePicker |
| 7 | **Wallet Settings** | [page.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/user/wallet-settings/page.tsx) | ⭐⭐⭐ | Dialog, Modal |
| 8 | **Layout** (Shell) | [layout.tsx](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/app/(user)/layout.tsx) | ⭐⭐ | Scaffold, BottomNav |

### API Endpoints cần kết nối
Dựa trên [API_DOCUMENTATION.md](file:///d:/nguyen/truongnguyenvo.work/learning/stock-token/API_DOCUMENTATION.md):

| API | Method | Endpoint | Dùng ở màn hình |
|-----|--------|----------|-----------------|
| Login | POST | `/api/auth/login` | Login |
| Profile | GET | `/api/user/{wallet}/profile` | Dashboard, Trade, Wallet, Profile |
| Stock Price | GET | `/api/stock/price` | Dashboard, Trade |
| Buy Token | POST | `/api/trade/buy` | Trade |
| Sell Token | POST | `/api/trade/sell` | Trade |
| Deposit VND | POST | `/api/payment/deposit-vnd` | Wallet |
| Withdraw VND | POST | `/api/payment/withdraw-vnd` | Wallet |
| Deposit Token | POST | `/api/user/{wallet}/deposit-token` | Wallet |
| Withdraw Token | POST | `/api/user/{wallet}/withdraw-token` | Wallet |
| Transactions | GET | `/api/user/{wallet}/transaction` | History, Dashboard |
| Submit KYC | POST | `/api/user/kyc/submit` | KYC |
| View Private Key | POST | `/api/user/{wallet}/view-private-key` | Wallet Settings |
| Change Wallet | POST | `/api/user/{wallet}/change-wallet` | Wallet Settings |

---

## Phase 1: Setup & Flutter Fundamentals (Ngày 1-3)

### 🎯 Mục tiêu
- Cài đặt môi trường Flutter hoàn chỉnh
- Hiểu kiến trúc Flutter và so sánh với React/Next.js
- Tạo project Stock Token Flutter

### 📚 Kiến thức cần học

#### 1.1 Cài đặt môi trường
```
- Flutter SDK (stable channel)
- Android Studio + Android SDK
- VS Code + Flutter extension
- Emulator / Physical device setup
- flutter doctor (kiểm tra cài đặt)
```

#### 1.2 Flutter Architecture (PHỎNG VẤN HAY HỎI ⚡)

```
┌─────────────────────────────────────┐
│           Your Flutter App          │
├─────────────────────────────────────┤
│         Framework (Dart)            │
│  ┌──────────┬───────────┬────────┐  │
│  │ Material │ Cupertino │ Widget │  │
│  ├──────────┴───────────┴────────┤  │
│  │     Rendering Layer           │  │
│  ├───────────────────────────────┤  │
│  │     Animation, Painting       │  │
│  ├───────────────────────────────┤  │
│  │     Foundation                │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│         Engine (C/C++)              │
│  ┌──────────┬───────────┬────────┐  │
│  │  Skia    │  Dart VM  │ Text   │  │
│  └──────────┴───────────┴────────┘  │
├─────────────────────────────────────┤
│      Platform (Android/iOS)         │
└─────────────────────────────────────┘
```

**So sánh React vs Flutter cho phỏng vấn:**

| Concept | React/Next.js | Flutter |
|---------|---------------|---------|
| Component | Function Component | Widget (StatelessWidget / StatefulWidget) |
| State | useState, useEffect | setState, initState, dispose |
| Props | props | Constructor parameters |
| Styling | CSS/Tailwind | Widget properties + ThemeData |
| Navigation | next/router | Navigator 2.0 / GoRouter |
| State Management | Context/Redux/Zustand | Provider/Riverpod/Bloc |
| Package Manager | npm | pub.dev |
| Build tool | Webpack/Turbopack | Flutter build system |
| Hot Reload | Fast Refresh | Hot Reload (stateful) + Hot Restart |

#### 1.3 Câu hỏi phỏng vấn Phase 1
```
Q: Flutter là gì? Tại sao chọn Flutter thay vì React Native?
A: Flutter là UI toolkit của Google, dùng Dart, render qua Skia engine
   (không dùng bridge như RN). Ưu điểm: hiệu năng native, hot reload,
   single codebase cho iOS/Android/Web/Desktop.

Q: Giải thích Flutter rendering pipeline?
A: Widget → Element → RenderObject. Widget là immutable description,
   Element quản lý lifecycle, RenderObject thực hiện layout + paint.

Q: Hot Reload vs Hot Restart?
A: Hot Reload giữ state, inject code mới. Hot Restart reset toàn bộ state.
   Hot Reload nhanh hơn (~1s), Hot Restart chậm hơn (~3-5s).
```

### 🔨 Bài tập thực hành
```bash
# 1. Tạo project
flutter create stock_token_app --org com.tnt

# 2. Chạy thử trên emulator
cd stock_token_app
flutter run

# 3. Sửa lib/main.dart, thử hot reload
# 4. Chạy flutter doctor, fix mọi issue
```

---

## Phase 2: Dart Language Deep Dive (Ngày 4-6) - xong

### 🎯 Mục tiêu
- Nắm vững Dart syntax, đặc biệt khác biệt với TypeScript/JavaScript
- Hiểu null safety, generics, async/await trong Dart

### 📚 Kiến thức cần học

#### 2.1 Dart Basics (so sánh với TypeScript)

```dart
// ===== VARIABLES =====
// TypeScript: const name: string = "TNT";
// Dart:
final String name = "TNT";        // runtime constant (≈ const in JS)
const String appName = "Stock Token"; // compile-time constant
var price = 35000;                 // type inference
late String walletAddress;         // khởi tạo sau (≈ lazy init)

// ===== NULL SAFETY (PHỎNG VẤN HAY HỎI ⚡) =====
// TypeScript: string | null
// Dart:
String? nullableName;              // có thể null
String nonNullName = "TNT";       // không thể null
String result = nullableName ?? "default"; // null coalescing
int length = nullableName?.length ?? 0;    // null-aware access

// ===== CLASSES =====
// TypeScript interface → Dart abstract class / mixin
class UserProfile {
  //sửa dụng final -> nếu update thì dùng copyWith()-> provider mới biết mà update lại giao diện
  final String walletAddress;
  final String fullName;
  final double vndBalance;
  final double tokenBalance;
  final String kycStatus;
  final bool isWhitelisted;

  // Named constructor (rất hay dùng trong Flutter)
  UserProfile({
    required this.walletAddress,
    required this.fullName,
    required this.vndBalance,
    required this.tokenBalance,
    required this.kycStatus,
    required this.isWhitelisted,
  });

  // Factory constructor (cho JSON parsing - PHỎNG VẤN HAY HỎI)
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      walletAddress: json['walletAddress'] as String,
      fullName: json['fullName'] as String,
      vndBalance: (json['vndBalance'] as num).toDouble(),
      tokenBalance: (json['tokenBalance'] as num).toDouble(),
      kycStatus: json['kycStatus'] as String,
      isWhitelisted: json['isWhitelisted'] as bool,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() => {
    'walletAddress': walletAddress,
    'fullName': fullName,
    'vndBalance': vndBalance,
    'tokenBalance': tokenBalance,
    'kycStatus': kycStatus,
    'isWhitelisted': isWhitelisted,
  };
  //hàm phục vụ chức năng copy đối tượng
  UserProfile copyWith({
    String? walletAddress,
    String? fullName,
  }) {
    return UserProfile(
      walletAddress: walletAddress ?? this.walletAddress,
      fullName: fullName ?? this.fullName,
      vndBalance: vndBalance ?? this.vndBalance,
      tokenBalance: tokenBalance ?? this.tokenBalance,
      kycStatus: kycStatus ?? this.kycStatus,
      isWhitelisted: isWhitelisted ?? this.isWhitelisted,
    );
  }
}

// ===== ENUM (dùng cho Transaction types) =====
enum TransactionType {
  deposit('DEPOSIT', 'Nạp VND'),
  withdraw('WITHDRAW', 'Rút VND'),
  buyStock('BUY_STOCK', 'Mua Token'),
  sellStock('SELL_STOCK', 'Bán Token'),
  depositTokenOnchain('DEPOSIT_TOKEN_ONCHAIN', 'Nạp Token (On-chain)'),
  withdrawTokenOnchain('WITHDRAW_TOKEN_ONCHAIN', 'Rút Token (On-chain)');

  final String value;
  final String label;
  const TransactionType(this.value, this.label);
}

// ===== ASYNC/AWAIT (giống JS nhưng dùng Future thay Promise) =====
Future<UserProfile> fetchProfile(String wallet) async {
  final response = await http.get(Uri.parse('/api/user/$wallet/profile'));
  final data = jsonDecode(response.body);
  return UserProfile.fromJson(data['data']);
}

// ===== COLLECTIONS =====
// TypeScript: Record<string, string>
// Dart:
Map<String, String> typeLabels = {
  'DEPOSIT': 'Nạp VND',
  'WITHDRAW': 'Rút VND',
};

// List (Array)
List<Transaction> transactions = [];
var filtered = transactions.where((t) => t.type == 'BUY_STOCK').toList();
```

#### 2.2 Dart Advanced (cho phỏng vấn)

```dart
// ===== MIXINS (như đa kế thừa -> kế thừa luôn cả đoạn code) =====
mixin FormValidation {
  String? validateAmount(String? value) {
    if (value == null || value.isEmpty) return 'Vui lòng nhập số tiền';
    if (double.tryParse(value) == null) return 'Số tiền không hợp lệ';
    if (double.parse(value) <= 0) return 'Số tiền phải lớn hơn 0';
    return null;
  }
}

// ===== EXTENSION METHODS (hàm mở rộng) =====
extension CurrencyFormat on double {
  String toVND() {
    final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');
    return formatter.format(this);
  }
}
// Usage: profile.vndBalance.toVND() → "1.000.000 ₫"

// ===== GENERICS =====
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;

  ApiResponse({required this.success, required this.message, this.data});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'],
      message: json['message'],
      data: json['data'] != null ? fromJsonT(json['data']) : null,
    );
  }
}
```

#### 2.3 Câu hỏi phỏng vấn Phase 2
```
Q: Giải thích null safety trong Dart?
A: Dart 2.12+ có sound null safety. Biến mặc định non-nullable.
   Dùng ? cho có thể null, ! cho khẳng định là không null, ?? cho giá trị mặc định,
   ?. cho truy cập null-aware, late cho lazy initialization.

Q: final vs const trong Dart?
A: final = runtime constant (giá trị gán 1 lần, có thể tính runtime).
   const = compile-time constant (giá trị phải biết lúc compile).
   VD: final now = DateTime.now(); ✅  const now = DateTime.now(); ❌

Q: factory constructor là gì?
A: Constructor có thể return instance đã có (cache), subtype, hoặc null. 
   Hay dùng cho fromJson(), singleton pattern.

Q: Mixin vs Abstract class?
A: Mixin dùng `with` keyword, không có constructor, cho phép kế thừa nhiều hành động. 
   Abstract class dùng `extends`, chỉ kế thừa được 1 class.
```

### 🔨 Bài tập thực hành
Tạo các model classes cho Stock Token app:
```
lib/
  models/
    user_profile.dart       (class UserProfile + fromJson)
    transaction.dart        (class Transaction + enum TransactionType)
    price_data.dart         (class PriceData)
    api_response.dart       (generic ApiResponse<T>)
```

---

## Phase 3: Widget System & UI Cơ Bản (Ngày 7-12)

### 🎯 Mục tiêu
- Hiểu Widget tree, StatelessWidget vs StatefulWidget
- Tạo reusable widgets tương đương với components/ui của Next.js
- Implement layout cơ bản (Scaffold, BottomNavigationBar)

### 📚 Kiến thức cần học

#### 3.1 Widget Lifecycle (PHỎNG VẤN RẤT HAY HỎI ⚡⚡)

```
StatelessWidget:
  build() → render UI → done
  (rebuild khi parent thay đổi hoặc InheritedWidget thay đổi)

StatefulWidget Lifecycle:
  createState()
    → initState()         ← (≈ componentDidMount / useEffect([]))
      → didChangeDependencies()
        → build()          ← (≈ render)
          → didUpdateWidget() ← (≈ useEffect with deps)
            → setState()  ← (trigger rebuild)
              → build()
                → deactivate()
                  → dispose()  ← (≈ componentWillUnmount / cleanup)
```
widget được tạo -> initState (gọi API, khởi tạo data) -> build (vẽ lại UI khi setState, mỗi widget chỉ có 1 class State) -> dispose (dọn dẹp khi widget bị xóa)

**Mapping React → Flutter:**
```dart
// React: useState
// Flutter:
class _MyWidgetState extends State<MyWidget> {
  bool isLoading = false;  // ≈ const [isLoading, setIsLoading] = useState(false)

  void startLoading() {
    setState(() {       // ≈ setIsLoading(true)
      isLoading = true;
    });
  }
}

// React: useEffect(() => { fetch(); }, [])
// Flutter:
@override
void initState() {
  super.initState();
  fetchProfile();
}

// React: useEffect cleanup / return () => { ... }
// Flutter:
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

#### 3.2 Tạo Design System (tương đương components/ui)

Mapping UI components Next.js → Flutter:

| Next.js Component | Flutter Widget | File |
|-------------------|---------------|------|
| `<Card>` | Custom `AppCard` | `lib/widgets/app_card.dart` |
| `<Button>` | Custom `AppButton` | `lib/widgets/app_button.dart` |
| `<Input>` | Custom `AppInput` | `lib/widgets/app_input.dart` |
| `<Badge>` | Custom `AppBadge` | `lib/widgets/app_badge.dart` |
| `<Modal>` | `showDialog()` / `showModalBottomSheet()` | `lib/widgets/app_modal.dart` |
| `<Tabs>` | `TabBar` + `TabBarView` | Built-in |
| `<Toast>` | `ScaffoldMessenger.showSnackBar()` | Built-in |

```dart
// Ví dụ: AppCard widget (tương đương Card component trong Next.js)
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Gradient? gradient;
  final String? variant; // 'default', 'bordered'

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.gradient,
    this.variant,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: gradient,
        color: gradient == null ? Colors.white : null,
        borderRadius: BorderRadius.circular(16),
        border: variant == 'bordered'
            ? Border.all(color: Colors.grey.shade200)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}
```

#### 3.3 Theme System (PHỎNG VẤN HAY HỎI)

```dart
// lib/core/theme.dart
class AppTheme {
  // Colors
  static const Color primary = Color(0xFF2563EB);       // blue-600
  static const Color primaryDark = Color(0xFF4338CA);    // indigo-700
  static const Color success = Color(0xFF22C55E);        // green-500
  static const Color danger = Color(0xFFEF4444);         // red-500
  static const Color warning = Color(0xFFF59E0B);        // yellow-500

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: primary),
    fontFamily: 'Inter',
    // ... card themes, button themes, input themes
  );
}
```

#### 3.4 Câu hỏi phỏng vấn Phase 3
```
Q: StatelessWidget vs StatefulWidget?
A: StatelessWidget: immutable, chỉ phụ thuộc vào input (constructor).
   StatefulWidget: có mutable state, có lifecycle methods.
   Rule: Dùng Stateless khi có thể, Stateful khi cần local state.

Q: Giải thích Widget tree, Element tree, và RenderObject tree?
A: Widget tree = blueprint (mô tả UI, immutable, rebuild thường xuyên).
   Element tree = quản lý lifecycle, link Widget ↔ RenderObject.
   RenderObject tree = thực hiện layout, painting lên screen.
   Widget rẻ (rebuild), RenderObject đắt (Flutter tối ưu reuse).

Q: BuildContext là gì?
A: Handle tới vị trí của widget trong Element tree.
   Dùng để: tìm InheritedWidget, navigate, show dialog, access theme.

Q: Key trong Flutter là gì? Khi nào cần dùng?
A: Key giúp Flutter identify widget khi rebuild.
   Cần khi: reorder list items, giữ state khi widget move trong tree.
   Types: ValueKey, ObjectKey, UniqueKey, GlobalKey.
```

### 🔨 Bài tập thực hành
Implement cấu trúc project và Design System:

```
lib/
  core/
    theme.dart              (ThemeData, colors, text styles)
    constants.dart          (API URLs, app constants)
  widgets/
    app_card.dart           (≈ Card component)
    app_button.dart         (≈ Button component với variants)
    app_input.dart          (≈ Input component)
    app_badge.dart          (≈ Badge component)
    loading_spinner.dart    (≈ animate-spin div)
  main.dart                 (MaterialApp + theme)
```

---

## Phase 4: Navigation & State Management (Ngày 13-18)

### 🎯 Mục tiêu
- Implement bottom navigation (giống layout.tsx)
- Học state management (Provider hoặc Riverpod)
- Setup routing cho toàn app

### 📚 Kiến thức cần học

#### 4.1 Navigation (PHỎNG VẤN RẤT HAY HỎI ⚡⚡)

```dart
// ===== CÁCH 1: Navigator 1.0 (Imperative) =====
Navigator.push(context, MaterialPageRoute(builder: (_) => TradePage()));
Navigator.pop(context);

// ===== CÁCH 2: GoRouter (Declarative - ĐỀ XUẤT) =====
// Tương tự Next.js file-based routing
final goRouter = GoRouter(
  initialLocation: '/dashboard',
  routes: [
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => DashboardPage()),
        GoRoute(path: '/trade', builder: (_, state) => TradePage(
          tab: state.uri.queryParameters['tab'],
        )),
        GoRoute(path: '/wallet', builder: (_, __) => WalletPage()),
        GoRoute(path: '/history', builder: (_, __) => HistoryPage()),
        GoRoute(path: '/profile', builder: (_, __) => ProfilePage()),
      ],
    ),
    GoRoute(path: '/kyc', builder: (_, __) => KYCPage()),
    GoRoute(path: '/wallet-settings', builder: (_, __) => WalletSettingsPage()),
  ],
);
```

#### 4.2 Bottom Navigation Shell (tương đương layout.tsx)

```dart
// Mapping từ layout.tsx:
// navItems = [
//   { href: '/user/dashboard', label: 'Trang chủ', icon: HomeIcon },
//   { href: '/user/trade', label: 'Giao dịch', icon: ChartIcon },
//   ...
// ]

class AppShell extends StatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final _navItems = [
    (icon: Icons.home_rounded, label: 'Trang chủ', path: '/dashboard'),
    (icon: Icons.candlestick_chart, label: 'Giao dịch', path: '/trade'),
    (icon: Icons.account_balance_wallet, label: 'Ví tiền', path: '/wallet'),
    (icon: Icons.history, label: 'Lịch sử', path: '/history'),
    (icon: Icons.person, label: 'Cá nhân', path: '/profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Header (tương đương <header> trong layout.tsx)
      appBar: AppBar(
        title: Row(
          children: [
            Container(/* Logo TNT */),
            const Text('Stock Token'),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications), onPressed: () {}),
        ],
      ),

      // Main content
      body: widget.child,

      // Bottom Navigation (tương đương <nav> trong layout.tsx)
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() => _currentIndex = index);
          context.go(_navItems[index].path);
        },
        items: _navItems.map((item) => BottomNavigationBarItem(
          icon: Icon(item.icon),
          label: item.label,
        )).toList(),
      ),
    );
  }
}
```

#### 4.3 State Management (PHỎNG VẤN RẤT HAY HỎI ⚡⚡⚡)

**Tổng quan các giải pháp:**

```
┌──────────────────────────────────────────────────┐
│              State Management Options            │
├──────────┬───────────┬───────────┬───────────────┤
│ setState │ Provider  │ Riverpod  │ BLoC          │
│ (local)  │ (simple)  │ (modern)  │ (enterprise)  │
├──────────┼───────────┼───────────┼───────────────┤
│ Widget   │ App-wide  │ App-wide  │ App-wide      │
│ scope    │ ChangeN.  │ Type-safe │ Event-driven  │
│ Simple   │ Easy      │ Testable  │ Predictable   │
└──────────┴───────────┴───────────┴───────────────┘
         ← Đơn giản          Phức tạp →
```

**Đề xuất: Riverpod** (phổ biến nhất hiện tại, dễ test, type-safe)

```dart
// ===== Riverpod Setup =====

// Provider cho user profile (tương đương useState + useEffect trong React)
final userProfileProvider = FutureProvider.autoDispose
    .family<UserProfile, String>((ref, walletAddress) async {
  final apiService = ref.read(apiServiceProvider);
  return apiService.fetchProfile(walletAddress);
});

// Provider cho stock price
final stockPriceProvider = FutureProvider.autoDispose<PriceData>((ref) async {
  final apiService = ref.read(apiServiceProvider);
  return apiService.fetchPrice();
});

// State provider cho wallet address (tương đương global state)
final walletAddressProvider = StateProvider<String?>((ref) => null);

// Notifier cho trade actions
class TradeNotifier extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> buyToken(String wallet, double amount) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(apiServiceProvider);
      await api.buyToken(wallet, amount);
      // Refresh profile after buy
      ref.invalidate(userProfileProvider);
    });
  }
}
```

#### 4.4 Câu hỏi phỏng vấn Phase 4
```
Q: So sánh Navigator 1.0 vs Navigator 2.0 (Router)?
A: Nav 1.0: imperative (push/pop), đơn giản, khó deep linking.
   Nav 2.0: declarative, hỗ trợ deep linking, web URLs, complex flows.
   GoRouter = wrapper cho Nav 2.0, dễ dùng hơn.

Q: Tại sao chọn Riverpod thay vì Provider/Bloc?
A: Riverpod: compile-time safe (no runtime ProviderNotFoundException),
   không phụ thuộc BuildContext, auto-dispose, better testing.
   Provider: đơn giản hơn nhưng context-dependent.
   Bloc: structured hơn (event → state) nhưng nhiều boilerplate.

Q: Provider vs Riverpod?
A: Provider phụ thuộc widget tree (BuildContext), Riverpod thì không.
   Riverpod có thể access provider từ bất kỳ đâu, type-safe hơn,
   hỗ trợ auto-dispose và family modifiers.

Q: Khi nào dùng setState vs State Management?
A: setState: local UI state (animation, form input, toggle).
   State Management: shared state (user data, auth, cart).
```

### 🔨 Bài tập thực hành

```
lib/
  core/
    router.dart             (GoRouter setup, all routes)
  providers/
    auth_provider.dart      (walletAddress, login state)
    user_provider.dart      (UserProfile provider)
    price_provider.dart     (Stock price provider)
  screens/
    app_shell.dart          (Scaffold + BottomNavigationBar)
```

---

## Phase 5: Implement Từng Màn Hình (Ngày 19-35) ⭐ CORE PHASE

### 🎯 Mục tiêu
- Implement đầy đủ 7 màn hình + layout
- Mỗi màn hình gắn với kiến thức Flutter cụ thể

---

### 📱 5.1 Dashboard Screen (Ngày 19-22)

**Kiến thức Flutter học được:**
- `Column`, `Row`, `SizedBox`, `Padding`
- `GridView` (quick actions grid 4 columns)
- `LinearGradient` (asset card gradient)
- `ListView` (recent transactions)
- Custom Painting / `fl_chart` package (price chart)

**Mapping cụ thể từ Next.js → Flutter:**

```dart
// Next.js: <div className="mb-4">
//            <h1 className="text-xl font-bold">Xin chào, {name} 👋</h1>
// Flutter:
Padding(
  padding: const EdgeInsets.only(bottom: 16),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Xin chào, ${profile?.fullName ?? "Nhà đầu tư"} 👋',
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
      if (profile?.isWhitelisted == true)
        Row(
          children: [
            Icon(Icons.verified, color: Colors.green, size: 16),
            const SizedBox(width: 4),
            Text('Đã xác minh', style: TextStyle(color: Colors.grey)),
          ],
        ),
    ],
  ),
);

// Next.js: <Card className="bg-gradient-to-br from-blue-600 to-indigo-700">
// Flutter:
AppCard(
  gradient: const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2563EB), Color(0xFF4338CA)],
  ),
  child: Column(
    children: [
      // Tổng tài sản
      Text('Tổng tài sản', style: TextStyle(color: Colors.blue.shade200)),
      Text(totalAsset.toVND(),
        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
      const SizedBox(height: 16),
      // Grid 2 cột
      Row(
        children: [
          Expanded(child: _balanceBox('Số dư VND', vndBalance.toVND())),
          const SizedBox(width: 12),
          Expanded(child: _balanceBox('Cổ phần TNT', '${tokenBalance} Token')),
        ],
      ),
    ],
  ),
);

// Next.js: <div className="grid grid-cols-4 gap-3"> (Quick Actions)
// Flutter:
GridView.count(
  crossAxisCount: 4,
  shrinkWrap: true,
  physics: const NeverScrollableScrollPhysics(),
  crossAxisSpacing: 12,
  children: [
    _quickAction(Icons.add, 'Nạp tiền', Colors.green, () => context.go('/wallet?tab=vnd&action=deposit')),
    _quickAction(Icons.remove, 'Rút tiền', Colors.red, () => context.go('/wallet?tab=vnd&action=withdraw')),
    _quickAction(Icons.shopping_cart, 'Mua ESOP', Colors.blue, () => context.go('/trade?tab=buy')),
    _quickAction(Icons.attach_money, 'Bán ESOP', Colors.orange, () => context.go('/trade?tab=sell')),
  ],
);
```

**Package cần dùng:**
- `fl_chart` — vẽ biểu đồ giá (thay cho SVG placeholder)

---

### 📱 5.2 Trade Screen (Ngày 23-25)

**Kiến thức Flutter học được:**
- `TabBar` + `TabBarView` + `TabController` (Mua/Bán tabs)
- `TextEditingController` (form input management)
- `Form` + `FormField` validation
- Async operations + loading states

**Mapping cụ thể:**

```dart
// Next.js: <Tabs defaultValue={defaultTab}>
//            <TabsTrigger value="buy">Mua</TabsTrigger>
//            <TabsTrigger value="sell">Bán</TabsTrigger>
// Flutter:
class _TradePageState extends State<TradePage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _buyAmountController = TextEditingController();
  final _sellAmountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.defaultTab == 'sell' ? 1 : 0,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _buyAmountController.dispose();
    _sellAmountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Price Header Card
        AppCard(child: /* price display */),

        // Balance Info (2 columns)
        Row(children: [/* VND balance */, /* Token balance */]),

        // Tab Bar
        TabBar(
          controller: _tabController,
          tabs: const [Tab(text: 'Mua'), Tab(text: 'Bán')],
        ),

        // Tab Content
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildBuyTab(),   // Buy form
              _buildSellTab(),  // Sell form
            ],
          ),
        ),
      ],
    );
  }
}
```

**Câu hỏi phỏng vấn:**
```
Q: SingleTickerProviderStateMixin là gì?
A: Cung cấp Ticker cho animation (TabController cần).
   Ticker = callback mỗi frame. Single = 1 animation controller.
   Nếu nhiều AnimationController → dùng TickerProviderStateMixin.

Q: Tại sao cần dispose() TextEditingController?
A: Tránh memory leak. Controller giữ listener và resources,
   cần giải phóng khi widget bị remove khỏi tree.
```

---

### 📱 5.3 Wallet Screen (Ngày 26-29)

**Kiến thức Flutter học được:**
- **Nested TabBar** (VND/Token → Nạp/Rút = 2 level tabs)
- Complex form handling
- `Clipboard` API
- Conditional rendering patterns

**Đây là màn hình phức tạp nhất** — có nested tabs:

```
Wallet
├── Tab: VND
│   ├── Sub-tab: Nạp tiền (deposit form + bank info + confirmation)
│   └── Sub-tab: Rút tiền (withdraw form + bank details)
└── Tab: Token (TNT)
    ├── Sub-tab: Nạp Token (instructions + txHash input)
    └── Sub-tab: Rút Token (amount input + wallet display)
```

```dart
// Nested TabController pattern
class _WalletPageState extends State<WalletPage> with TickerProviderStateMixin {
  late TabController _mainTabController;  // VND / Token
  late TabController _vndSubTabController;   // Nạp / Rút VND
  late TabController _tokenSubTabController; // Nạp / Rút Token

  @override
  void initState() {
    super.initState();
    _mainTabController = TabController(length: 2, vsync: this);
    _vndSubTabController = TabController(length: 2, vsync: this);
    _tokenSubTabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _mainTabController.dispose();
    _vndSubTabController.dispose();
    _tokenSubTabController.dispose();
    super.dispose();
  }
}
```

**Lưu ý thiết kế:**
- Deposit VND có 2 bước (hiển thị bank info → xác nhận) → dùng `setState` với `depositConfirmed` flag
- Copy wallet address → dùng `Clipboard.setData(ClipboardData(text: address))`

---

### 📱 5.4 History Screen (Ngày 30-31)

**Kiến thức Flutter học được:**
- `ListView.builder` (lazy loading list - PHỎNG VẤN HAY HỎI)
- Horizontal scrolling filter buttons (`SingleChildScrollView` + `Row`)
- `FutureBuilder` / `Consumer` (Riverpod) cho async data

```dart
// Next.js: <div className="flex gap-2 mb-4 overflow-x-auto">
//            {filterOptions.map(opt => <Button onClick={...}>
// Flutter:
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Row(
    children: filterOptions.map((opt) => Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(opt.label),
        selected: currentFilter == opt.value,
        onSelected: (_) => setState(() => currentFilter = opt.value),
      ),
    )).toList(),
  ),
);

// ListView.builder vs ListView (PHỎNG VẤN)
// ListView: build tất cả children → tốn memory
// ListView.builder: lazy build, chỉ build visible items → efficient
ListView.builder(
  itemCount: filteredTransactions.length,
  itemBuilder: (context, index) {
    final tx = filteredTransactions[index];
    return TransactionTile(transaction: tx);
  },
);
```

**Câu hỏi phỏng vấn:**
```
Q: ListView vs ListView.builder vs ListView.separated?
A: ListView: tất cả children built upfront (danh sách nhỏ).
   ListView.builder: lazy build, chỉ build visible items (danh sách lớn).
   ListView.separated: như builder nhưng có separator giữa items.

Q: shrinkWrap là gì? Khi nào dùng?
A: shrinkWrap=true → ListView co lại theo nội dung thay vì expand full.
   Dùng khi ListView nằm trong Column/ScrollView. Tránh nếu list dài
   (mất lợi ích lazy loading).
```

---

### 📱 5.5 Profile Screen (Ngày 32-33)

**Kiến thức Flutter học được:**
- `CircleAvatar` (profile picture)
- `ListTile` (settings menu items)
- `AlertDialog` (confirm logout)
- Navigation between screens

```dart
// Next.js: <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
//            {profile?.fullName?.charAt(0) || '?'}
// Flutter:
CircleAvatar(
  radius: 32,
  backgroundColor: AppTheme.primary,
  child: Text(
    profile?.fullName.characters.first ?? '?',
    style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
  ),
);

// Settings menu items (mapping từ <button> list trong Next.js)
// Flutter: dùng ListTile
Card(
  child: Column(
    children: [
      ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(8)),
          child: Icon(Icons.wallet, color: Colors.purple.shade600),
        ),
        title: const Text('Quản lý ví'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => context.push('/wallet-settings'),
      ),
      // ... Bảo mật, Thông báo, Hỗ trợ
    ],
  ),
);
```

---

### 📱 5.6 KYC Screen (Ngày 34-36)

**Kiến thức Flutter học được:**
- `Stepper` widget (3-step form)
- `Image Picker` (camera/gallery — thay cho URL input)
- Multi-step form state management
- Conditional screen rendering (PENDING/REJECTED/form)

```dart
// Next.js: step state + progress dots
// Flutter: có thể dùng built-in Stepper hoặc custom
class _KYCPageState extends State<KYCPage> {
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    // Nếu KYC đang pending
    if (kycStatus == 'PENDING') return _buildPendingScreen();
    if (kycStatus == 'REJECTED') return _buildRejectedScreen();

    return Stepper(
      currentStep: _currentStep,
      onStepContinue: () {
        if (_currentStep < 2) setState(() => _currentStep++);
        else handleSubmitKYC();
      },
      onStepCancel: () {
        if (_currentStep > 0) setState(() => _currentStep--);
      },
      steps: [
        Step(
          title: const Text('Thông tin cá nhân'),
          content: Column(children: [/* fullName, idCardNumber inputs */]),
          isActive: _currentStep >= 0,
        ),
        Step(
          title: const Text('Ảnh CCCD'),
          content: Column(children: [/* image pickers for front/back */]),
          isActive: _currentStep >= 1,
        ),
        Step(
          title: const Text('Ảnh Selfie'),
          content: Column(children: [/* selfie image picker */]),
          isActive: _currentStep >= 2,
        ),
      ],
    );
  }
}
```

**Nâng cấp so với bản web:** Dùng `image_picker` package để chụp ảnh trực tiếp từ camera thay vì paste URL.

---

### 📱 5.7 Wallet Settings Screen (Ngày 37-38)

**Kiến thức Flutter học được:**
- `showDialog()` / `showModalBottomSheet()` (thay Modal component)
- `obscureText` cho password input
- Clipboard operations
- Conditional UI rendering

```dart
// Next.js: <Modal isOpen={showPrivateKeyModal} onClose={closePrivateKeyModal}>
// Flutter:
void _showPrivateKeyDialog() {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Xem Private Key'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!showPrivateKey) ...[
            const Text('Vui lòng nhập mật khẩu để xác thực'),
            TextField(
              obscureText: true,
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Mật khẩu'),
            ),
          ] else ...[
            // Warning box + private key display + copy button
          ],
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
        ElevatedButton(onPressed: _handleViewPrivateKey, child: const Text('Xác nhận')),
      ],
    ),
  );
}
```

---

## Phase 6: Networking & API Integration (Ngày 39-44)

### 🎯 Mục tiêu
- Kết nối Flutter app với backend API
- Xử lý loading, error, retry
- Implement interceptor, token management

### 📚 Kiến thức cần học

#### 6.1 HTTP Client (dio package - ĐỀ XUẤT)

```dart
// lib/services/api_service.dart
class ApiService {
  late final Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: 'http://your-server-ip:3000', // URL backend Next.js
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // Interceptor (PHỎNG VẤN HAY HỎI)
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add auth token if needed
        print('→ ${options.method} ${options.path}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        print('← ${response.statusCode} ${response.requestOptions.path}');
        handler.next(response);
      },
      onError: (error, handler) {
        print('✗ Error: ${error.message}');
        handler.next(error);
      },
    ));
  }

  // Fetch User Profile
  Future<UserProfile> fetchProfile(String walletAddress) async {
    final response = await _dio.get('/api/user/$walletAddress/profile');
    final apiResponse = ApiResponse.fromJson(
      response.data,
      (json) => UserProfile.fromJson(json),
    );
    if (!apiResponse.success) throw Exception(apiResponse.message);
    return apiResponse.data!;
  }

  // Buy Token
  Future<void> buyToken(String walletAddress, double amount) async {
    await _dio.post('/api/trade/buy', data: {
      'walletAddress': walletAddress,
      'amountToken': amount,
    });
  }

  // ... tất cả API calls
}
```

#### 6.2 Error Handling Pattern

```dart
// Generic API call wrapper
Future<T> safeApiCall<T>(Future<T> Function() call) async {
  try {
    return await call();
  } on DioException catch (e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        throw AppException('Kết nối timeout. Vui lòng thử lại.');
      case DioExceptionType.receiveTimeout:
        throw AppException('Server phản hồi quá chậm.');
      case DioExceptionType.badResponse:
        final message = e.response?.data['message'] ?? 'Có lỗi xảy ra';
        throw AppException(message);
      default:
        throw AppException('Không thể kết nối server.');
    }
  }
}
```

#### 6.3 Repository Pattern (PHỎNG VẤN HAY HỎI)

```
┌──────────┐     ┌────────────┐     ┌────────────┐
│   UI     │ ──→ │ Repository │ ──→ │ API Service│
│ (Screen) │     │ (abstract) │     │ (Dio)      │
└──────────┘     └────────────┘     └────────────┘
                       │
                 ┌─────┴─────┐
                 │ Local DB  │
                 │ (Hive/SP) │
                 └───────────┘
```

```dart
// Abstract repository
abstract class UserRepository {
  Future<UserProfile> getProfile(String wallet);
  Future<List<Transaction>> getTransactions(String wallet);
}

// Implementation
class UserRepositoryImpl implements UserRepository {
  final ApiService _apiService;
  final SharedPreferences _prefs;

  @override
  Future<UserProfile> getProfile(String wallet) async {
    try {
      final profile = await _apiService.fetchProfile(wallet);
      // Cache locally
      _prefs.setString('cached_profile', jsonEncode(profile.toJson()));
      return profile;
    } catch (e) {
      // Fallback to cache
      final cached = _prefs.getString('cached_profile');
      if (cached != null) return UserProfile.fromJson(jsonDecode(cached));
      rethrow;
    }
  }
}
```

#### 6.4 Câu hỏi phỏng vấn Phase 6
```
Q: http package vs dio?
A: http: đơn giản, lightweight, cơ bản.
   dio: interceptors, cancel token, upload progress,
   form data, automatic retry. Dùng dio cho production app.

Q: Repository Pattern là gì?
A: Abstraction layer giữa data source và business logic.
   UI không biết data đến từ API hay local cache.
   Dễ test (mock repository), dễ thay đổi data source.

Q: Cách handle error trong Flutter?
A: try/catch + custom Exception classes.
   Dùng AsyncValue (Riverpod) hoặc Either (dartz) cho functional approach.
   Show SnackBar/Dialog cho user-facing errors.
```

### 🔨 Bài tập thực hành

```
lib/
  services/
    api_service.dart        (Dio setup, interceptors)
    api_endpoints.dart      (all endpoint constants)
  repositories/
    user_repository.dart    (UserProfile, Transactions)
    trade_repository.dart   (Buy, Sell)
    payment_repository.dart (Deposit, Withdraw VND/Token)
    kyc_repository.dart     (Submit KYC)
  providers/
    user_provider.dart      (updated with repository)
    trade_provider.dart
    payment_provider.dart
```

---

## Phase 7: Advanced Topics (Ngày 45-52)

### 🎯 Mục tiêu
- Animation, Performance optimization
- Local storage, Security
- Testing, CI/CD

### 📚 Kiến thức cần học

#### 7.1 Animations (PHỎNG VẤN HAY HỎI)

```dart
// Implicit Animation (đơn giản, tự animate khi property thay đổi)
AnimatedContainer(
  duration: const Duration(milliseconds: 300),
  curve: Curves.easeInOut,
  height: isExpanded ? 200 : 60,
  color: isActive ? Colors.blue : Colors.grey,
);

// Hero Animation (transition giữa screens)
// Dashboard → Trade: animate giá token
Hero(
  tag: 'token-price',
  child: Text(price.toVND()),
);

// Explicit Animation (full control)
class _PriceChartState extends State<PriceChart> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
    _controller.forward();
  }
}
```

**Câu hỏi phỏng vấn:**
```
Q: Implicit vs Explicit animation?
A: Implicit (AnimatedContainer, AnimatedOpacity): tự animate khi
   property thay đổi. Simple, ít control.
   Explicit (AnimationController): full control, có thể pause/reverse/repeat.
   Dùng khi cần animation phức tạp hoặc coordinated animations.

Q: Giải thích vsync trong AnimationController?
A: vsync = vertical sync, đảm bảo animation chạy đúng frame rate.
   Dùng TickerProviderStateMixin để cung cấp Ticker.
   Khi widget off-screen, Ticker tự pause → tiết kiệm tài nguyên.
```

#### 7.2 Local Storage & Security

```dart
// SharedPreferences (key-value, nhỏ)
final prefs = await SharedPreferences.getInstance();
await prefs.setString('wallet_address', address);

// flutter_secure_storage (encrypt, cho private key)
final secureStorage = FlutterSecureStorage();
await secureStorage.write(key: 'private_key', value: privateKey);

// Hive (NoSQL database, nhanh hơn SQLite cho đọc)
@HiveType(typeId: 0)
class CachedProfile extends HiveObject {
  @HiveField(0)
  final String walletAddress;
  // ...
}
```

#### 7.3 Performance Optimization (PHỎNG VẤN HAY HỎI)

```
1. const constructors → tránh rebuild không cần thiết
   const Text('Hello')  ✅
   Text('Hello')        ❌ (rebuild mỗi lần parent rebuild)

2. RepaintBoundary → isolate repaint
   RepaintBoundary(child: ExpensiveWidget())

3. ListView.builder → lazy rendering (đã học ở Phase 5)

4. Image caching → cached_network_image package

5. Avoid rebuilding entire tree → granular setState
   ❌ setState(() { everything = changed; });
   ✅ Chia nhỏ widget, setState chỉ ở widget cần thay đổi

6. DevTools → Flutter Inspector, Performance overlay
```

#### 7.4 Testing (PHỎNG VẤN HAY HỎI ⚡⚡)

```dart
// Unit Test
test('UserProfile fromJson parses correctly', () {
  final json = {'walletAddress': '0x123', 'fullName': 'Test', ...};
  final profile = UserProfile.fromJson(json);
  expect(profile.fullName, 'Test');
  expect(profile.walletAddress, '0x123');
});

// Widget Test
testWidgets('Dashboard shows greeting', (tester) async {
  await tester.pumpWidget(MaterialApp(
    home: DashboardPage(),
  ));
  expect(find.text('Xin chào, Nhà đầu tư 👋'), findsOneWidget);
});

// Integration Test
// test/integration/trade_flow_test.dart
testWidgets('Buy token flow', (tester) async {
  // Navigate to trade
  // Enter amount
  // Tap Buy button
  // Verify success message
});

// Mocking with Mockito
class MockUserRepository extends Mock implements UserRepository {}
```

```
Q: Unit Test vs Widget Test vs Integration Test?
A: Unit: test 1 function/class, nhanh, không cần Flutter.
   Widget: test 1 widget, pump vào test environment, verify UI.
   Integration: test toàn flow, chạy trên device/emulator, chậm nhất.
   Tỷ lệ lý tưởng: 70% unit, 20% widget, 10% integration.
```

### 🔨 Bài tập thực hành

```
lib/
  core/
    local_storage.dart      (SharedPreferences + SecureStorage wrapper)
  animations/
    fade_slide_transition.dart
    price_counter_animation.dart
test/
  unit/
    models/user_profile_test.dart
    services/api_service_test.dart
  widget/
    screens/dashboard_test.dart
    widgets/app_card_test.dart
  integration/
    trade_flow_test.dart
```

---

## Phase 8: Interview Preparation (Ngày 53-56)

### 🎯 Mục tiêu
- Tổng hợp kiến thức
- Chuẩn bị trả lời các câu hỏi phỏng vấn phổ biến
- Portfolio presentation

### 📋 Top 30 Câu Hỏi Phỏng Vấn Flutter

#### Cơ bản (Junior)
| # | Câu hỏi | Phase |
|---|---------|-------|
| 1 | Flutter là gì? Ưu nhược điểm? | 1 |
| 2 | Hot Reload vs Hot Restart? | 1 |
| 3 | StatelessWidget vs StatefulWidget? | 3 |
| 4 | Widget lifecycle (initState, dispose, etc.)? | 3 |
| 5 | BuildContext là gì? | 3 |
| 6 | Key là gì? Khi nào dùng? | 3 |
| 7 | final vs const? | 2 |
| 8 | Null safety trong Dart? | 2 |
| 9 | factory constructor? | 2 |
| 10 | ListView vs ListView.builder? | 5 |

#### Trung cấp (Mid-level)
| # | Câu hỏi | Phase |
|---|---------|-------|
| 11 | So sánh state management (Provider/Riverpod/Bloc)? | 4 |
| 12 | Navigator 1.0 vs 2.0? | 4 |
| 13 | Implicit vs Explicit animation? | 7 |
| 14 | Repository Pattern? | 6 |
| 15 | Dio interceptors? | 6 |
| 16 | Widget tree vs Element tree vs RenderObject tree? | 3 |
| 17 | InheritedWidget là gì? | 4 |
| 18 | Mixin vs Abstract class? | 2 |
| 19 | Stream trong Dart? | 4 |
| 20 | Unit Test vs Widget Test vs Integration Test? | 7 |

#### Nâng cao (Senior)
| # | Câu hỏi | Phase |
|---|---------|-------|
| 21 | Performance optimization techniques? | 7 |
| 22 | const constructor giúp gì cho performance? | 7 |
| 23 | Isolate là gì? Khi nào dùng? | 7 |
| 24 | Platform Channel (MethodChannel)? | 7 |
| 25 | Flutter rendering pipeline chi tiết? | 1 |
| 26 | DevTools và profiling? | 7 |
| 27 | CI/CD cho Flutter app? | 7 |
| 28 | App architecture (Clean Architecture)? | 6 |
| 29 | Dependency Injection trong Flutter? | 4 |
| 30 | Memory management và dispose pattern? | 5 |

### 📂 Portfolio Presentation

Khi đi phỏng vấn, bạn sẽ present project Stock Token với cấu trúc:

```
1. Giới thiệu dự án
   - "Stock Token là ứng dụng giao dịch token cổ phiếu, ban đầu build bằng
     Next.js, tôi đã port sang Flutter mobile."

2. Kiến trúc
   - Clean Architecture: UI → Provider → Repository → API Service
   - State Management: Riverpod
   - Routing: GoRouter

3. Demo các màn hình
   - Dashboard (chart, gradient card, quick actions)
   - Trade (tab bar, form, real-time calculation)
   - Wallet (nested tabs, multi-step deposit flow)
   - KYC (stepper, image picker)

4. Technical highlights
   - Null safety throughout
   - Repository pattern with caching
   - Custom theme system
   - Unit + Widget tests
   - Error handling with user-friendly messages
```

---

## 📁 Cấu trúc Project Cuối Cùng

```
stock_token_app/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── theme.dart                  (ThemeData, colors)
│   │   ├── constants.dart              (API base URL, etc.)
│   │   ├── router.dart                 (GoRouter)
│   │   ├── local_storage.dart          (SharedPref + SecureStorage)
│   │   └── extensions.dart             (toVND(), etc.)
│   ├── models/
│   │   ├── user_profile.dart
│   │   ├── transaction.dart
│   │   ├── price_data.dart
│   │   └── api_response.dart
│   ├── services/
│   │   ├── api_service.dart            (Dio client)
│   │   └── api_endpoints.dart
│   ├── repositories/
│   │   ├── user_repository.dart
│   │   ├── trade_repository.dart
│   │   ├── payment_repository.dart
│   │   └── kyc_repository.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── user_provider.dart
│   │   ├── trade_provider.dart
│   │   ├── payment_provider.dart
│   │   └── price_provider.dart
│   ├── screens/
│   │   ├── app_shell.dart              (Scaffold + BottomNav)
│   │   ├── dashboard/
│   │   │   └── dashboard_screen.dart
│   │   ├── trade/
│   │   │   └── trade_screen.dart
│   │   ├── wallet/
│   │   │   ├── wallet_screen.dart
│   │   │   └── wallet_settings_screen.dart
│   │   ├── history/
│   │   │   └── history_screen.dart
│   │   ├── profile/
│   │   │   └── profile_screen.dart
│   │   └── kyc/
│   │       └── kyc_screen.dart
│   └── widgets/
│       ├── app_card.dart
│       ├── app_button.dart
│       ├── app_input.dart
│       ├── app_badge.dart
│       ├── loading_spinner.dart
│       └── transaction_tile.dart
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── pubspec.yaml
└── README.md
```

---

## 📦 Packages Cần Dùng

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # Routing
  go_router: ^14.0.0

  # State Management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # Networking
  dio: ^5.4.0

  # Local Storage
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.0.0

  # UI Enhancements
  fl_chart: ^0.68.0                # Biểu đồ giá
  intl: ^0.19.0                    # Number/Date formatting (toVND)
  shimmer: ^3.0.0                  # Loading skeleton
  cached_network_image: ^3.3.0     # Image caching

  # Media
  image_picker: ^1.0.0             # Camera/Gallery cho KYC

  # Utils
  flutter_svg: ^2.0.0              # SVG icons

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.0
  build_runner: ^2.4.0
  riverpod_generator: ^2.3.0
```

---

## ⏱️ Timeline Tổng Hợp

| Phase | Nội dung | Thời gian | Ngày |
|-------|----------|-----------|------|
| 1 | Setup & Fundamentals | 3 ngày | 1-3 |
| 2 | Dart Language | 3 ngày | 4-6 |
| 3 | Widget System & UI | 6 ngày | 7-12 |
| 4 | Navigation & State | 6 ngày | 13-18 |
| 5 | **Implement Screens** | 17 ngày | 19-35 |
| 6 | Networking & API | 6 ngày | 36-41 |
| 7 | Advanced Topics | 8 ngày | 42-49 |
| 8 | Interview Prep | 4 ngày | 50-53 |
| | **TỔNG** | **~53 ngày (~8 tuần)** | |

> [!TIP]
> Nếu bạn đã quen với lập trình và có thể dành 6-8 tiếng/ngày, có thể rút ngắn xuống **5-6 tuần**. Nếu chỉ part-time (2-3 tiếng/ngày), dự kiến **10-12 tuần**.

---

## Open Questions

> [!IMPORTANT]
> **1. Bạn muốn dùng State Management nào?**
> - **Riverpod** (đề xuất — phổ biến nhất, type-safe, dễ test)
> - **Provider** (đơn giản hơn nhưng context-dependent)
> - **Bloc/Cubit** (structured, enterprise-level, nhiều boilerplate hơn)
>
> **2. Bạn muốn target platform nào?**
> - Chỉ Android?
> - Android + iOS?
> - Android + iOS + Web?
>
> **3. Bạn có kinh nghiệm Dart/Flutter trước đây không?**
> Nếu có, tôi sẽ rút gọn Phase 1-2 và tập trung vào implementation.
>
> **4. Backend API chạy ở đâu?**
> Flutter app cần biết base URL để kết nối. Bạn sẽ chạy Next.js server local hay deploy lên server?
>
> **5. Bạn muốn tôi bắt đầu implement code Flutter luôn trong repo này hay tạo repo riêng?**
