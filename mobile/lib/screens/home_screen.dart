import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/navigation_provider.dart';
import '../models/shop_model.dart';
import '../models/event_model.dart';
import 'shop_list_screen.dart';
import 'event_list_screen.dart';
import 'favorite_screen.dart';
import 'map_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  static void switchToTab(BuildContext context, int tabIndex, {ShopModel? focusShop, EventModel? focusEvent}) {
    final navigationProvider = context.read<NavigationProvider>();
    navigationProvider.switchToTab(tabIndex, focusShop: focusShop, focusEvent: focusEvent);
  }

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Consumer2<AuthProvider, NavigationProvider>(
      builder: (context, authProvider, navigationProvider, child) {
        if (!authProvider.isAuthenticated) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.of(context).pushReplacementNamed('/login');
          });
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final screens = [
          const ShopListScreen(),
          const EventListScreen(),
          MapScreen(
            key: ValueKey('map_${navigationProvider.focusShop?.id}_${navigationProvider.focusEvent?.id}'),
            focusShop: navigationProvider.focusShop,
            focusEvent: navigationProvider.focusEvent,
          ),
          const FavoriteScreen(),
          const ProfileScreen(),
        ];

        return Scaffold(
          body: IndexedStack(
            index: navigationProvider.selectedIndex,
            children: screens,
          ),
          bottomNavigationBar: BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            currentIndex: navigationProvider.selectedIndex,
            onTap: (index) {
              navigationProvider.switchToTab(index);
            },
            selectedItemColor: Colors.blue,
            unselectedItemColor: Colors.grey,
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.store),
                label: 'Shop',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.event),
                label: 'Event',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.map),
                label: 'Map',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.favorite),
                label: 'Favorite',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }
}