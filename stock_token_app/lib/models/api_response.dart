class ApiResponse<T>{
  final String message;
  final bool success;
  final T? data;
  
  ApiResponse({
    required this.message, 
    required this.success, 
    required this.data
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT, 
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      // Nếu có data thì dùng hàm fromJsonT để parse, nếu không thì null
      data: json['data'] != null ? fromJsonT(json['data']) : null,
    );
  }
}