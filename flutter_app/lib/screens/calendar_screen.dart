import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../models/recording.dart';
import '../services/api_service.dart';

enum CalendarTab { bookings, memos, shopping }

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});
  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  Map<String, dynamic> _monthSummary = {};
  CalendarTab _selectedTab = CalendarTab.bookings;
  
  List<dynamic> _bookings = [];
  List<Recording> _doneMemos = [];
  List<Recording> _doneShopping = [];
  
  bool _loading = false;
  String _authEmail = '';

  @override
  void initState() {
    super.initState();
    _loadUser();
    _fetchMonthSummary(_focusedDay);
    _fetchTabData();
  }

  Future<void> _loadUser() async {
    final email = await ApiService.getAuthEmail();
    if (email != null && mounted) {
      setState(() => _authEmail = email);
    }
  }

  Future<void> _fetchMonthSummary(DateTime date) async {
    final monthStr = DateFormat('yyyy-MM').format(date);
    try {
      final summary = await ApiService.getCalendarMonthSummary(monthStr);
      if (mounted) setState(() => _monthSummary = summary);
    } catch (_) {}
  }

  Future<void> _fetchTabData() async {
    setState(() => _loading = true);
    try {
      if (_selectedTab == CalendarTab.bookings) {
        final data = await ApiService.getReservationsByDate(_selectedDay);
        _bookings = data;
      } else if (_selectedTab == CalendarTab.memos) {
        final data = await ApiService.getDoneByDate(_selectedDay);
        _doneMemos = data;
      } else if (_selectedTab == CalendarTab.shopping) {
        // We'll fetch all active and historic shopping, or just use the backend if it supported it.
        // For simplicity, we just fetch all historic and filter locally if we don't have a specific endpoint.
        // Actually, we can fetch getByDate and if we had a generic one...
        // Let's use getDoneByDate for now and assume it was updated or we filter locally from getActiveShopping
        // Wait, we need an API to get done shopping by date. We don't have one explicitly. 
        // We will fetch from getActiveShopping + getShoppingHistory? No, let's just make a new call or reuse.
        // I will just use getShoppingHistory and filter.
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E3A8A),
        title: const Text('📅 Calendar & History', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
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
            
          TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              _fetchTabData();
            },
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
              _fetchMonthSummary(focusedDay);
            },
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) {
                final dateStr = DateFormat('yyyy-MM-dd').format(day);
                final dayData = _monthSummary[dateStr];
                int bookings = dayData != null ? (dayData['bookings'] ?? 0) : 0;
                
                return Container(
                  margin: const EdgeInsets.all(4),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: bookings > 0 ? Colors.red.shade100 : null,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${day.day}',
                    style: TextStyle(
                      color: bookings > 0 ? Colors.red.shade900 : Colors.black,
                      fontWeight: bookings > 0 ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                );
              },
            ),
          ),
          
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            color: Colors.grey.shade200,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildTab(CalendarTab.bookings, 'Bookings', Icons.hotel),
                _buildTab(CalendarTab.memos, 'Memos', Icons.note),
                _buildTab(CalendarTab.shopping, 'Shopping', Icons.shopping_cart),
              ],
            ),
          ),
          
          Expanded(
            child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _buildTabContent(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTab(CalendarTab tab, String title, IconData icon) {
    final isSelected = _selectedTab == tab;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedTab = tab);
        _fetchTabData();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E3A8A) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: isSelected ? Colors.white : Colors.grey.shade700),
            const SizedBox(width: 4),
            Text(title, style: TextStyle(
              color: isSelected ? Colors.white : Colors.grey.shade700,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            )),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTabContent() {
    if (_selectedTab == CalendarTab.bookings) {
      if (_bookings.isEmpty) return const Center(child: Text('No bookings for this date.'));
      return ListView.builder(
        itemCount: _bookings.length,
        itemBuilder: (ctx, i) {
          final b = _bookings[i];
          final guest = b['guest'] ?? {};
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListTile(
              leading: const Icon(Icons.person, color: Color(0xFF1E3A8A)),
              title: Text(guest['full_name'] ?? 'Unknown Guest', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Room: ${b['room_or_unit'] ?? 'N/A'} - Status: ${b['status']}'),
              trailing: Text('\$${b['total_usd']}'),
            ),
          );
        },
      );
    } else if (_selectedTab == CalendarTab.memos) {
      if (_doneMemos.isEmpty) return const Center(child: Text('No completed memos for this date.'));
      return ListView.builder(
        itemCount: _doneMemos.length,
        itemBuilder: (ctx, i) {
          final m = _doneMemos[i];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: ListTile(
              leading: const Icon(Icons.check_circle, color: Colors.green),
              title: Text(m.summary, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(m.transcript, maxLines: 2, overflow: TextOverflow.ellipsis),
            ),
          );
        },
      );
    } else {
      return const Center(child: Text('Shopping history fetching to be implemented...'));
    }
  }
}
