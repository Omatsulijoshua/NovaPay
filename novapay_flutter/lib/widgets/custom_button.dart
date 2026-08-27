import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool loading;
  final bool fullWidth;
  final bool isSecondary;

  const CustomButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.loading = false,
    this.fullWidth = true,
    this.isSecondary = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final themeColor = isSecondary ? Colors.grey[200]! : const Color(0xFF059669);
    final textColor = isSecondary ? Colors.grey[800]! : Colors.white;

    Widget child = loading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(textColor),
            ),
          )
        : Text(
            text,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          );

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 48,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: themeColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          disabledBackgroundColor: themeColor.withOpacity(0.5),
        ),
        onPressed: loading ? null : onPressed,
        child: child,
      ),
    );
  }
}
