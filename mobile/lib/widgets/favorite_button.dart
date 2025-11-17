import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/favorite_provider.dart';

class FavoriteButton extends StatefulWidget {
  final String itemType;
  final String itemId;
  final double size;
  final Color? activeColor;
  final Color? inactiveColor;

  const FavoriteButton({
    super.key,
    required this.itemType,
    required this.itemId,
    this.size = 24,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton>
    with SingleTickerProviderStateMixin {
  bool _isFavorite = false;
  bool _isLoading = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));

    _loadFavoriteStatus();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadFavoriteStatus() async {
    final favoriteProvider = context.read<FavoriteProvider>();
    final isFavorite = await favoriteProvider.isFavorite(
      itemType: widget.itemType,
      itemId: widget.itemId,
    );
    
    if (mounted) {
      setState(() {
        _isFavorite = isFavorite;
      });
    }
  }

  Future<void> _toggleFavorite() async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    final favoriteProvider = context.read<FavoriteProvider>();
    bool success;

    if (widget.itemType == 'shop') {
      success = await favoriteProvider.toggleShopFavorite(widget.itemId);
    } else {
      success = await favoriteProvider.toggleEventFavorite(widget.itemId);
    }

    if (success) {
      setState(() {
        _isFavorite = !_isFavorite;
      });
      
      // アニメーション実行
      _animationController.forward().then((_) {
        _animationController.reverse();
      });

      // フィードバック
      if (_isFavorite) {
        _showFeedback('お気に入りに追加しました');
      } else {
        _showFeedback('お気に入りから削除しました');
      }
    } else {
      _showFeedback('操作に失敗しました');
    }

    setState(() {
      _isLoading = false;
    });
  }

  void _showFeedback(String message) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: InkWell(
            onTap: _isLoading ? null : _toggleFavorite,
            borderRadius: BorderRadius.circular(widget.size / 2),
            child: Container(
              padding: EdgeInsets.all(widget.size * 0.3),
              child: _isLoading
                  ? SizedBox(
                      width: widget.size,
                      height: widget.size,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          widget.activeColor ?? Colors.red,
                        ),
                      ),
                    )
                  : Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      size: widget.size,
                      color: _isFavorite
                          ? (widget.activeColor ?? Colors.red)
                          : (widget.inactiveColor ?? Colors.grey),
                    ),
            ),
          ),
        );
      },
    );
  }
}