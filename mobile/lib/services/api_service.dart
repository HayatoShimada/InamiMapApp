import 'package:dio/dio.dart';
import '../models/map_point.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3001/api';
  late final Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptors for logging in debug mode
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (object) {
          print('[API] $object');
        },
      ),
    );
  }

  Future<List<MapPoint>> getMapPoints() async {
    try {
      final response = await _dio.get('/locations');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['locations'] ?? [];
        return data.map((json) => MapPoint.fromJson(json)).toList();
      } else {
        throw ApiException('Failed to load map points: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<MapPoint> getMapPoint(String id) async {
    try {
      final response = await _dio.get('/locations/$id');
      
      if (response.statusCode == 200) {
        return MapPoint.fromJson(response.data);
      } else {
        throw ApiException('Failed to load map point: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<bool> checkHealth() async {
    try {
      final response = await _dio.get('/health');
      return response.statusCode == 200;
    } on DioException {
      return false;
    }
  }

  ApiException _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException('Connection timeout. Please check your internet connection.');
      
      case DioExceptionType.connectionError:
        return ApiException('Cannot connect to server. Please check your internet connection.');
      
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        if (statusCode != null) {
          if (statusCode >= 400 && statusCode < 500) {
            return ApiException('Client error: ${e.response?.statusMessage}');
          } else if (statusCode >= 500) {
            return ApiException('Server error: ${e.response?.statusMessage}');
          }
        }
        return ApiException('Request failed with status code: $statusCode');
      
      case DioExceptionType.cancel:
        return ApiException('Request was cancelled.');
      
      default:
        return ApiException('An unexpected error occurred: ${e.message}');
    }
  }
}

class ApiException implements Exception {
  final String message;
  
  const ApiException(this.message);
  
  @override
  String toString() => 'ApiException: $message';
}