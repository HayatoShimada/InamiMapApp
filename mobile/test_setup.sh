#!/bin/bash

# Test Setup Script for InamiMapApp Mobile Development Environment
# Tests both Android and iOS build environments

set -e

echo "🧪 Testing InamiMapApp Mobile Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test counters
tests_passed=0
tests_failed=0
tests_warnings=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((tests_passed++))
        return 0
    else
        print_error "$test_name"
        ((tests_failed++))
        return 1
    fi
}

run_test_with_warning() {
    local test_name="$1"
    local test_command="$2"
    local warning_message="$3"
    
    print_status "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((tests_passed++))
    else
        print_warning "$test_name - $warning_message"
        ((tests_warnings++))
    fi
}

echo "📋 Running Development Environment Tests..."
echo

# Test 1: Flutter installation
run_test "Flutter SDK" "command -v flutter"

# Test 2: Dart SDK
run_test "Dart SDK" "command -v dart"

# Test 3: Flutter doctor basic check
if command -v flutter &> /dev/null; then
    print_status "Running Flutter Doctor..."
    flutter doctor
    echo
fi

# Test 4: Android development tools
run_test_with_warning "Android SDK" "ls $HOME/Library/Android/sdk/platform-tools/adb" "Install Android Studio and configure SDK"

# Test 5: iOS development tools  
run_test_with_warning "Xcode" "ls /Applications/Xcode.app" "Install Xcode from App Store"

# Test 6: CocoaPods
run_test_with_warning "CocoaPods" "command -v pod" "Install with: sudo gem install cocoapods"

# Test 7: Firebase CLI
run_test_with_warning "Firebase CLI" "command -v firebase" "Install with: npm install -g firebase-tools"

# Test 8: FlutterFire CLI
run_test_with_warning "FlutterFire CLI" "command -v flutterfire" "Install with: dart pub global activate flutterfire_cli"

echo
echo "📱 Testing Project Configuration..."

# Test 9: Project dependencies
print_status "Testing: Flutter pub get"
if flutter pub get; then
    print_success "Dependencies installed"
    ((tests_passed++))
else
    print_error "Failed to install dependencies"
    ((tests_failed++))
fi

# Test 10: Firebase configuration files
run_test_with_warning "Android Firebase Config" "test -f android/app/google-services.json" "Download from Firebase Console"
run_test_with_warning "iOS Firebase Config" "test -f ios/Runner/GoogleService-Info.plist" "Download from Firebase Console"

# Test 11: Platform-specific builds (if devices available)
echo
print_status "Testing build capabilities..."

# Test Android build
if flutter devices | grep -q android; then
    print_status "Testing Android build..."
    if timeout 300 flutter build apk --debug > /dev/null 2>&1; then
        print_success "Android build successful"
        ((tests_passed++))
    else
        print_error "Android build failed"
        ((tests_failed++))
    fi
else
    print_warning "No Android devices detected - skipping build test"
    ((tests_warnings++))
fi

# Test iOS build (on macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if flutter devices | grep -q ios; then
        print_status "Testing iOS build..."
        if timeout 300 flutter build ios --debug --no-codesign > /dev/null 2>&1; then
            print_success "iOS build successful"
            ((tests_passed++))
        else
            print_error "iOS build failed"
            ((tests_failed++))
        fi
    else
        print_warning "No iOS devices/simulators detected - skipping build test"
        ((tests_warnings++))
    fi
fi

# Test 12: Code analysis
print_status "Testing code analysis..."
if flutter analyze; then
    print_success "Code analysis passed"
    ((tests_passed++))
else
    print_error "Code analysis failed"
    ((tests_failed++))
fi

# Test 13: Format check
print_status "Testing code formatting..."
if flutter format --set-exit-if-changed --dry-run .; then
    print_success "Code formatting correct"
    ((tests_passed++))
else
    print_warning "Code formatting issues detected - run 'flutter format .'"
    ((tests_warnings++))
fi

# Summary
echo
echo "📊 Test Results Summary"
echo "======================"
echo -e "${GREEN}Tests Passed: ${tests_passed}${NC}"
echo -e "${RED}Tests Failed: ${tests_failed}${NC}"
echo -e "${YELLOW}Warnings: ${tests_warnings}${NC}"
echo

if [ $tests_failed -eq 0 ]; then
    echo -e "${GREEN}✅ Development environment is ready!${NC}"
    echo
    echo "🚀 Next Steps:"
    echo "1. Configure Firebase project (./configure_firebase.sh)"
    echo "2. Download Firebase configuration files"
    echo "3. Test on physical devices"
    echo "4. Start development with: flutter run"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    echo
    echo "🔧 Common Solutions:"
    echo "- Run ./setup_dev_env.sh to install missing tools"
    echo "- Download Firebase config files from console"
    echo "- Install Xcode from App Store"
    echo "- Configure Android SDK path"
    exit 1
fi