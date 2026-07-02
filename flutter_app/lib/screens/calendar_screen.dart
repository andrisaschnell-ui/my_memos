import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/recording.dart';
import '../services/api_service.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});
  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  Map<String, int> _doneCounts = {};
  DateTime _selectedDate = DateTime.now();
  List<Recording> _doneMemos = [];
  bool _loading = false;
  String _authEmail = '';

  @override
  void initState() {
    super.initState();
    _loadUser();
    _fetchDoneCounts();
    _fetchDoneByDate(_selectedDate);
  }

  Future<void> _loadUser() async {
    final email = await ApiService.getAuthEmail();
    if (email != null && mounted) {
      setState(() => _authEmail = email);
    }
  }

  Future<void> _fetchDoneCounts() async {
    try {
      final counts = await ApiService.getCalendarDoneCounts();
      setState(() => _doneCounts = counts);
    } catch (_) {}
  }

  Future<void> _fetchDoneByDate(DateTime date) async {
    setState(() => _loading = true);
    try {
      final memos = await ApiService.getDoneByDate(date);
      setState(() { _doneMemos = memos; _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  void _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2024),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
      _fetchDoneByDate(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final count = _doneCounts[selectedStr] ?? 0;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3A8A),
        title: const Text('📅 Calendar History', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.calendar_month, color: Colors.white), onPressed: _pickDate),
        ],
      ),
      body: Column(
        children: [
          if (_authEmail.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
              color: const Color(0xFFEFF6FF),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.person, size: 16, color: Color(0xFF1D4ED8)),
                  const SizedBox(width: 6),
                  Text(
                    'Logged in as: $_authEmail',
                    style: const TextStyle(color: Color(0xFF1D4ED8), fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF2563EB),
            child: Column(
              children: [
                Text(
                  DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  '$count Completed (${count == 1 ? 'Memo' : 'Memos'})',
                  style: const TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
              : _doneMemos.isEmpty
                ? const Center(child: Text('No completed memos recorded for this date.', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _doneMemos.length,
                    itemBuilder: (context, index) {
                      final memo = _doneMemos[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: const Icon(Icons.check_circle, color: Colors.green),
                          title: Text(memo.summary, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E3A8A))),
                          subtitle: Text(memo.transcript, maxLines: 2, overflow: TextOverflow.ellipsis),
                          trailing: Text(DateFormat('HH:mm').format(memo.createdAt), style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}
