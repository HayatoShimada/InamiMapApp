import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class TestFirebaseScreen extends StatefulWidget {
  const TestFirebaseScreen({super.key});

  @override
  State<TestFirebaseScreen> createState() => _TestFirebaseScreenState();
}

class _TestFirebaseScreenState extends State<TestFirebaseScreen> {
  String _status = 'Initializing Firebase...';
  bool _isConnected = false;
  int _shopCount = 0;
  String _projectId = '';

  @override
  void initState() {
    super.initState();
    _testFirebaseConnection();
  }

  Future<void> _testFirebaseConnection() async {
    try {
      // Test 1: Firebase Core initialization
      setState(() {
        _status = 'Testing Firebase Core...';
      });
      
      final app = Firebase.app();
      _projectId = app.options.projectId;
      print('Firebase app: ${app.name}');
      print('Project ID: $_projectId');
      
      // Test 2: Firestore connection
      setState(() {
        _status = 'Testing Firestore connection...';
      });
      
      final firestore = FirebaseFirestore.instance;
      
      // Test 3: Try to read approved shops
      setState(() {
        _status = 'Reading shop data...';
      });
      
      final querySnapshot = await firestore
          .collection('shops')
          .where('approvalStatus', isEqualTo: 'approved')
          .limit(5)
          .get();
      
      setState(() {
        _shopCount = querySnapshot.docs.length;
        _isConnected = true;
        _status = 'Firebase connection successful!';
      });
      
      // Test 4: Firebase Auth check
      setState(() {
        _status = 'Testing Firebase Authentication...';
      });
      
      final auth = FirebaseAuth.instance;
      print('Current user: ${auth.currentUser?.uid ?? "None"}');
      
      setState(() {
        _status = 'All Firebase tests completed successfully!';
      });
      
    } catch (e) {
      setState(() {
        _status = 'Firebase connection failed: $e';
        _isConnected = false;
      });
      print('Firebase error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Firebase Connection Test'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isConnected ? Icons.check_circle : Icons.error,
              size: 80,
              color: _isConnected ? Colors.green : Colors.orange,
            ),
            const SizedBox(height: 24),
            Text(
              _status,
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            if (_isConnected) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text(
                        'Connection Details',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildDetailRow('Project ID:', _projectId),
                      const SizedBox(height: 8),
                      _buildDetailRow('Approved Shops:', '$_shopCount found'),
                      const SizedBox(height: 8),
                      _buildDetailRow('Firebase Auth:', 'Ready'),
                      const SizedBox(height: 8),
                      _buildDetailRow('Status:', '✅ Connected'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: _testFirebaseConnection,
                    child: const Text('Test Again'),
                  ),
                  OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Back to App'),
                  ),
                ],
              ),
            ] else ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _testFirebaseConnection,
                child: const Text('Retry Connection'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}