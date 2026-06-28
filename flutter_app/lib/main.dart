import 'package:flutter/material.dart';
import 'screens/record_screen.dart';
import 'screens/list_screen.dart';
import 'screens/shopping_screen.dart';
import 'screens/calendar_screen.dart';

void main() {
  runApp(const MyMemoryApp());
}

class MyMemoryApp extends StatelessWidget {
  const MyMemoryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Memory',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E3A8A)),
        useMaterial3: true,
      ),
      home: const MainNav(),
    );
  }
}

class MainNav extends StatefulWidget {
  const MainNav({super.key});
  @override
  State<MainNav> createState() => _MainNavState();
}

class _MainNavState extends State<MainNav> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    RecordScreen(),
    ListScreen(),
    ShoppingScreen(),
    CalendarScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        selectedItemColor: const Color(0xFF1E3A8A),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.mic), label: 'Record'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Memos'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Shopping'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Calendar'),
        ],
      ),
    );
  }
}
