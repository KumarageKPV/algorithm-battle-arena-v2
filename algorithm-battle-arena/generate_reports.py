import os
import re
import subprocess
from datetime import datetime

def parse_test_method(test_name, test_body):
    description = test_name.replace('_', ' - ').replace('Should', 'should')
    
    steps = []
    if 'Navigate().GoToUrl' in test_body:
        steps.append("1. Navigate to the target URL")
    
    if 'LoginAsStudent()' in test_body:
        steps.append("2. Login as student user")
    
    if 'FindElement' in test_body:
        steps.append("3. Locate required UI elements on the page")
    
    if 'SendKeys' in test_body:
        steps.append("4. Enter test data into input fields")
    
    if 'Click()' in test_body:
        steps.append("5. Click on interactive elements")
    
    if 'Window.Size' in test_body:
        steps.append("6. Change browser window size for responsive testing")
    
    if 'Assert' in test_body:
        steps.append("7. Verify expected results and element states")
    
    if 'ShouldLoad' in test_name:
        expected = "Page loads successfully without errors"
    elif 'ShouldDisplay' in test_name:
        expected = "All specified UI elements are visible and properly displayed"
    elif 'ShouldRedirect' in test_name:
        expected = "User is redirected to the correct page/URL"
    elif 'ShouldNavigate' in test_name:
        expected = "Navigation functions correctly and reaches target destination"
    elif 'ShouldAccept' in test_name:
        expected = "Form accepts valid input data correctly"
    elif 'ShouldValidate' in test_name:
        expected = "Form validation works as expected"
    elif 'ShouldShow' in test_name or 'ShouldHide' in test_name:
        expected = "Element visibility toggles correctly"
    elif 'Responsive' in test_name:
        expected = "Page layout adapts properly to different screen sizes"
    elif 'ShouldBeClickable' in test_name:
        expected = "Element is clickable and functions correctly"
    else:
        expected = "Test completes successfully with all assertions passing"
    
    return {
        'name': test_name,
        'description': description,
        'steps': steps if steps else ["1. Execute test scenario", "2. Verify expected behavior"],
        'expected': expected
    }

def parse_unit_test_method(test_name, test_body, inline_data_count=1):
    description = test_name.replace('_', ' - ').replace('Should', 'should')
    
    steps = []
    if 'new ' in test_body:
        steps.append("1. Create test objects and initialize data")
    
    if 'Mock' in test_body or 'Setup' in test_body:
        steps.append("2. Setup mock objects and dependencies")
    
    if 'Act' in test_body or '=' in test_body:
        steps.append("3. Execute the method under test")
    
    if 'Assert' in test_body:
        steps.append("4. Verify the expected results")
    
    if 'ShouldReturn' in test_name:
        expected = "Method returns the expected value"
    elif 'ShouldThrow' in test_name:
        expected = "Method throws the expected exception"
    elif 'ShouldCreate' in test_name:
        expected = "Object is created successfully"
    elif 'ShouldUpdate' in test_name:
        expected = "Data is updated correctly"
    elif 'ShouldDelete' in test_name:
        expected = "Data is deleted successfully"
    else:
        expected = "Unit test passes with expected behavior"
    
    tests = []
    for i in range(inline_data_count):
        test_entry = {
            'name': f"{test_name}" + (f" (Case {i+1})" if inline_data_count > 1 else ""),
            'description': description + (f" - Test case {i+1}" if inline_data_count > 1 else ""),
            'steps': steps if steps else ["1. Setup test data", "2. Execute method", "3. Verify results"],
            'expected': expected
        }
        tests.append(test_entry)
    
    return tests

def extract_tests_from_file(file_path, is_unit_test=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    class_match = re.search(r'public class (\w+)', content)
    class_name = class_match.group(1) if class_match else 'Unknown'
    
    tests = []
    
    method_pattern = r'(\[(?:Fact|Theory)\](?:\s*\[InlineData[^\]]*\])*)\s*public void (\w+)\([^)]*\)\s*\{(.*?)(?=\[(?:Fact|Theory)\]|\Z)'
    method_matches = re.findall(method_pattern, content, re.DOTALL)
    
    for attributes, test_name, test_body in method_matches:
        inline_data_count = len(re.findall(r'\[InlineData', attributes))
        if inline_data_count == 0:
            inline_data_count = 1
        
        if is_unit_test:
            test_list = parse_unit_test_method(test_name, test_body, inline_data_count)
            tests.extend(test_list)
        else:
            test_details = parse_test_method(test_name, test_body)
            tests.append(test_details)
    
    return class_name, tests

def generate_selenium_report():
    ui_test_dir = r"d:\New folder\algorthm-battle-arena\AlgorithmBattleArena.UiTests"
    root_dir = r"d:\New folder\algorthm-battle-arena"
    
    if not os.path.exists(ui_test_dir):
        print(f"UI test directory not found: {ui_test_dir}")
        return 0
    
    report_content = []
    
    report_content.append("# Selenium UI Test Cases Report")
    report_content.append(f"**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_content.append("")
    
    test_counter = 1
    total_tests = 0
    
    for file in sorted(os.listdir(ui_test_dir)):
        if file.endswith('Tests.cs'):
            file_path = os.path.join(ui_test_dir, file)
            class_name, tests = extract_tests_from_file(file_path, is_unit_test=False)
            
            if tests:
                report_content.append(f"## {class_name}")
                report_content.append("")
                
                for test in tests:
                    report_content.append(f"### Test Case #{test_counter}")
                    report_content.append("")
                    report_content.append(f"**Test Case ID/Name:** {test['name']}")
                    report_content.append("")
                    report_content.append(f"**Description/Objective:** {test['description']}")
                    report_content.append("")
                    report_content.append("**Steps/Procedure:**")
                    for step in test['steps']:
                        report_content.append(f"   {step}")
                    report_content.append("")
                    report_content.append(f"**Expected Result:** {test['expected']}")
                    report_content.append("")
                    report_content.append("---")
                    report_content.append("")
                    
                    test_counter += 1
                    total_tests += 1
    
    ui_files = len([f for f in os.listdir(ui_test_dir) if f.endswith('Tests.cs')])
    summary = [
        f"**Total Selenium Test Cases:** {total_tests}",
        f"**UI Test Classes:** {ui_files}",
        "",
        "---",
        ""
    ]
    
    report_content = report_content[:3] + summary + report_content[3:]
    
    output_file = os.path.join(root_dir, 'selenium_test_report.md')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_content))
    
    print(f"Selenium test report generated: {output_file}")
    return total_tests

def generate_unit_test_report():
    unit_test_dir = r"d:\New folder\algorthm-battle-arena\AlgorithmBattleArena.Tests"
    root_dir = r"d:\New folder\algorthm-battle-arena"
    
    if not os.path.exists(unit_test_dir):
        print(f"Unit test directory not found: {unit_test_dir}")
        return 0
    
    report_content = []
    
    report_content.append("# Unit Test Cases Report")
    report_content.append(f"**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_content.append("")
    
    test_counter = 1
    total_tests = 0
    
    for file in sorted(os.listdir(unit_test_dir)):
        if file.endswith('.cs') and 'Test' in file:
            file_path = os.path.join(unit_test_dir, file)
            class_name, tests = extract_tests_from_file(file_path, is_unit_test=True)
            
            if tests:
                report_content.append(f"## {class_name}")
                report_content.append("")
                
                for test in tests:
                    report_content.append(f"### Test Case #{test_counter}")
                    report_content.append("")
                    report_content.append(f"**Test Case ID/Name:** {test['name']}")
                    report_content.append("")
                    report_content.append(f"**Description/Objective:** {test['description']}")
                    report_content.append("")
                    report_content.append("**Steps/Procedure:**")
                    for step in test['steps']:
                        report_content.append(f"   {step}")
                    report_content.append("")
                    report_content.append(f"**Expected Result:** {test['expected']}")
                    report_content.append("")
                    report_content.append("---")
                    report_content.append("")
                    
                    test_counter += 1
                    total_tests += 1
    
    unit_files = len([f for f in os.listdir(unit_test_dir) if f.endswith('.cs') and 'Test' in f])
    summary = [
        f"**Total Unit Test Cases:** {total_tests}",
        f"**Unit Test Classes:** {unit_files}",
        "",
        "---",
        ""
    ]
    
    report_content = report_content[:3] + summary + report_content[3:]
    
    output_file = os.path.join(root_dir, 'unit_test_report.md')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_content))
    
    print(f"Unit test report generated: {output_file}")
    return total_tests

def run_tests_and_get_failures():
    """Run dotnet test and parse failures"""
    test_dir = r"d:\New folder\algorthm-battle-arena\AlgorithmBattleArena.Tests"
    if not os.path.exists(test_dir):
        return []
    
    try:
        # Run tests with detailed output
        result = subprocess.run(
            ['dotnet', 'test', '--verbosity', 'detailed'],
            cwd=test_dir,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        failures = []
        output = result.stdout + result.stderr
        lines = output.split('\n')
        
        # Track unique test failures to avoid duplicates
        seen_tests = set()
        
        for line in lines:
            line = line.strip()
            
            # Look for "Failed" followed by test name pattern
            if line.startswith('Failed') and '.' in line:
                # Extract full test name after "Failed "
                test_full_name = line.replace('Failed ', '').strip()
                
                # Skip if we've already seen this test
                if test_full_name in seen_tests:
                    continue
                
                # Parse test name parts
                if '.' in test_full_name:
                    parts = test_full_name.split('.')
                    if len(parts) >= 2:
                        test_class = parts[-2]
                        test_method = parts[-1]
                        
                        # Only add if it looks like a valid test
                        if 'Test' in test_class or 'Test' in test_method:
                            test_info = {
                                'class': test_class,
                                'method': test_method,
                                'error': 'Test execution failed'
                            }
                            failures.append(test_info)
                            seen_tests.add(test_full_name)
        
        print(f"Debug: Found {len(failures)} unique test failures")
        for failure in failures:
            print(f"  - {failure['class']}.{failure['method']}")
        
        return failures
    except Exception as e:
        print(f"Error running tests: {e}")
        return []

def categorize_bug_severity(test_class, test_method, error_msg):
    """Categorize bug severity based on test context"""
    error_lower = error_msg.lower()
    method_lower = test_method.lower()
    class_lower = test_class.lower()
    
    # Critical - Security, Authentication, Core functionality
    if any(keyword in class_lower for keyword in ['auth', 'security', 'password']):
        if any(keyword in method_lower for keyword in ['password', 'login', 'verify', 'hash']):
            return 'Critical'
    
    # Critical - Data integrity issues
    if 'delete' in method_lower and ('null' in error_lower or 'notfound' in error_lower):
        return 'Critical'
    
    # High - Controller responses, Business logic
    if 'controller' in class_lower:
        if any(keyword in method_lower for keyword in ['register', 'login', 'getproblem']):
            return 'High'
    
    # High - Repository operations
    if 'repository' in class_lower and any(keyword in method_lower for keyword in ['exists', 'getuserrole']):
        return 'High'
    
    # Medium - UI/UX, Pagination, API responses
    if any(keyword in class_lower for keyword in ['paged', 'controller']):
        return 'Medium'
    
    # Low - Edge cases, minor issues
    return 'Low'

def generate_bug_description(test_class, test_method, error_msg):
    """Generate bug description based on test failure"""
    if 'Assert.Equal' in error_msg or 'Expected:' in error_msg:
        return "Assertion failure - expected and actual values do not match"
    elif 'Assert.True' in error_msg or 'Assert.False' in error_msg:
        return "Boolean assertion failure - unexpected true/false result"
    elif 'Assert.NotNull' in error_msg or 'Assert.Null' in error_msg:
        return "Null assertion failure - unexpected null/non-null value"
    elif 'NotFound' in error_msg:
        return "Resource not found - expected resource does not exist"
    elif 'BadRequest' in error_msg:
        return "Bad request response - invalid request parameters"
    elif 'Unauthorized' in error_msg:
        return "Authorization failure - access denied"
    else:
        return "Test execution failure - unexpected behavior detected"

def analyze_bug_categories(bugs_by_severity):
    """Analyze bug categories to understand failure patterns"""
    categories = {'auth': 0, 'controller': 0, 'data': 0, 'repository': 0, 'helper': 0, 'other': 0}
    
    for severity, bugs in bugs_by_severity.items():
        for bug in bugs:
            file_lower = bug['file'].lower()
            if 'auth' in file_lower:
                categories['auth'] += 1
            elif 'controller' in file_lower:
                categories['controller'] += 1
            elif 'data' in file_lower:
                categories['data'] += 1
            elif 'repository' in file_lower:
                categories['repository'] += 1
            elif 'helper' in file_lower or 'paged' in file_lower:
                categories['helper'] += 1
            else:
                categories['other'] += 1
    
    return categories

def generate_impact_analysis(bugs_by_severity):
    """Generate dynamic impact analysis based on actual bugs found"""
    categories = analyze_bug_categories(bugs_by_severity)
    content = ["## Impact Analysis", ""]
    
    # Critical bugs impact
    critical_bugs = bugs_by_severity['Critical']
    if critical_bugs:
        content.append("### Critical Bugs Impact")
        impacts = []
        
        if any('auth' in bug['file'].lower() for bug in critical_bugs):
            impacts.append("- **Security**: Authentication system compromised, potential unauthorized access")
        if any('data' in bug['file'].lower() for bug in critical_bugs):
            impacts.append("- **Data Integrity**: Core data operations failing, risk of data corruption")
        if any('controller' in bug['file'].lower() for bug in critical_bugs):
            impacts.append("- **System Functionality**: Critical API endpoints not working")
        
        if not impacts:
            impacts.append("- **System Stability**: Critical functionality broken")
        
        content.extend(impacts)
        content.append("")
    
    # High bugs impact
    high_bugs = bugs_by_severity['High']
    if high_bugs:
        content.append("### High Bugs Impact")
        impacts = []
        
        if categories['controller'] > 0:
            impacts.append("- **API Reliability**: Controller endpoints returning incorrect responses")
        if categories['repository'] > 0:
            impacts.append("- **Data Access**: Repository layer failures affecting data retrieval")
        if categories['auth'] > 0:
            impacts.append("- **User Management**: Authentication and authorization issues")
        
        if not impacts:
            impacts.append("- **Business Logic**: Core application features affected")
        
        content.extend(impacts)
        content.append("")
    
    # Medium bugs impact
    medium_bugs = bugs_by_severity['Medium']
    if medium_bugs:
        content.append("### Medium Bugs Impact")
        impacts = []
        
        if categories['helper'] > 0:
            impacts.append("- **Utility Functions**: Helper and pagination functions not working correctly")
        if categories['controller'] > 0:
            impacts.append("- **API Responses**: Non-critical endpoint issues")
        
        if not impacts:
            impacts.append("- **User Experience**: Minor functionality issues")
        
        content.extend(impacts)
        content.append("")
    
    # Low bugs impact
    low_bugs = bugs_by_severity['Low']
    if low_bugs:
        content.append("### Low Bugs Impact")
        content.append("- **Edge Cases**: Minor scenario handling issues")
        content.append("- **Validation**: Non-critical validation problems")
        content.append("")
    
    return content

def generate_test_commands(bugs_by_severity):
    """Generate dynamic test execution commands based on failing test classes"""
    content = ["### Run Specific Test Categories", "```bash"]
    
    # Get unique test classes from all bugs
    test_classes = set()
    for severity, bugs in bugs_by_severity.items():
        for bug in bugs:
            class_name = bug['file'].replace('.cs', '')
            test_classes.add(class_name)
    
    if test_classes:
        content.append("# Run failing test classes")
        for test_class in sorted(test_classes):
            content.append(f'dotnet test --filter "FullyQualifiedName~{test_class}"')
    else:
        content.append("# No failing tests found")
        content.append('dotnet test --filter "FullyQualifiedName~YourTestClass"')
    
    content.extend(["```", ""])
    return content

def generate_recommendations(bugs_by_severity, total_bugs):
    """Generate dynamic recommendations based on bug analysis"""
    categories = analyze_bug_categories(bugs_by_severity)
    content = ["## Recommendations", ""]
    
    recommendations = []
    
    # Priority-based recommendations
    if bugs_by_severity['Critical']:
        recommendations.append(f"1. **URGENT**: Fix all {len(bugs_by_severity['Critical'])} Critical bugs immediately - system security/stability at risk")
    
    if bugs_by_severity['High']:
        recommendations.append(f"2. **High Priority**: Address {len(bugs_by_severity['High'])} High severity bugs in current sprint")
    
    if bugs_by_severity['Medium']:
        recommendations.append(f"3. **Medium Priority**: Schedule {len(bugs_by_severity['Medium'])} Medium severity bugs for next sprint")
    
    if bugs_by_severity['Low']:
        recommendations.append(f"4. **Low Priority**: Address {len(bugs_by_severity['Low'])} Low severity bugs in maintenance cycles")
    
    # Category-specific recommendations
    if categories['auth'] > 0:
        recommendations.append(f"5. **Security Focus**: {categories['auth']} authentication-related failures require immediate security review")
    
    if categories['controller'] > 0:
        recommendations.append(f"6. **API Testing**: {categories['controller']} controller failures indicate need for better API testing")
    
    if categories['data'] > 0:
        recommendations.append(f"7. **Data Layer**: {categories['data']} data-related failures require database and EF Core review")
    
    # General recommendations based on total bugs
    if total_bugs > 15:
        recommendations.append("8. **Code Quality**: High number of failures indicates need for comprehensive code review")
    elif total_bugs > 5:
        recommendations.append("8. **Testing Strategy**: Moderate failures suggest improving test coverage and validation")
    else:
        recommendations.append("8. **Maintenance**: Low failure count indicates good code quality, continue current practices")
    
    content.extend(recommendations)
    content.append("")
    
    return content

def generate_bug_report():
    root_dir = r"d:\New folder\algorthm-battle-arena"
    
    # Get test failures
    failures = run_tests_and_get_failures()
    
    # Categorize bugs
    bugs_by_severity = {'Critical': [], 'High': [], 'Medium': [], 'Low': []}
    
    for i, failure in enumerate(failures, 1):
        severity = categorize_bug_severity(failure['class'], failure['method'], failure['error'])
        bug_id = f"{severity[0]}{len(bugs_by_severity[severity]) + 1:03d}"
        
        bug = {
            'id': bug_id,
            'file': f"{failure['class']}.cs",
            'method': failure['method'],
            'description': generate_bug_description(failure['class'], failure['method'], failure['error']),
            'priority': 'P0' if severity == 'Critical' else 'P1' if severity == 'High' else 'P2' if severity == 'Medium' else 'P3'
        }
        bugs_by_severity[severity].append(bug)
    
    # Generate report content
    content = []
    content.append("# Test Bug Report - Algorithm Battle Arena")
    content.append("")
    content.append("## Overview")
    content.append("This report documents bugs found in the test suite based on actual test execution results.")
    content.append("")
    
    total_bugs = sum(len(bugs) for bugs in bugs_by_severity.values())
    content.append("## Bug Summary")
    content.append(f"- **Total Bugs**: {total_bugs}")
    content.append(f"- **Critical**: {len(bugs_by_severity['Critical'])}")
    content.append(f"- **High**: {len(bugs_by_severity['High'])}")
    content.append(f"- **Medium**: {len(bugs_by_severity['Medium'])}")
    content.append(f"- **Low**: {len(bugs_by_severity['Low'])}")
    content.append("")
    content.append("## Bug Details")
    content.append("")
    
    # Generate bug tables for each severity
    for severity in ['Critical', 'High', 'Medium', 'Low']:
        bugs = bugs_by_severity[severity]
        if bugs:
            content.append(f"### {severity} Severity Bugs ({len(bugs)})")
            content.append("")
            content.append("| Bug ID | File | Test Method | Description | Priority |")
            content.append("|--------|------|-------------|-------------|----------|")
            
            for bug in bugs:
                content.append(f"| {bug['id']} | {bug['file']} | {bug['method']} | {bug['description']} | {bug['priority']} |")
            
            content.append("")
    
    # Generate dynamic impact analysis and recommendations
    impact_analysis = generate_impact_analysis(bugs_by_severity)
    recommendations = generate_recommendations(bugs_by_severity, total_bugs)
    
    # Generate dynamic test execution commands
    test_commands = generate_test_commands(bugs_by_severity)
    
    # Add standard sections
    content.extend([
        "## Test Execution Commands",
        "",
        "### Run All Tests",
        "```bash",
        "cd AlgorithmBattleArena.Tests",
        "dotnet test",
        "```",
        ""
    ])
    
    content.extend(test_commands)
    
    content.extend(impact_analysis)
    content.extend(recommendations)
    
    output_file = os.path.join(root_dir, 'bug_report.md')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content))
    
    print(f"Bug report generated: {output_file} ({total_bugs} bugs found)")
    return total_bugs

def main():
    print("Generating all reports...")
    print("=" * 50)
    
    # Generate all three reports
    bugs_found = generate_bug_report()
    unit_tests = generate_unit_test_report()
    selenium_tests = generate_selenium_report()
    
    print("=" * 50)
    print("Report generation completed!")
    print(f"- Bug report: bug_report.md ({bugs_found} bugs found)")
    print(f"- Unit test report: unit_test_report.md ({unit_tests} tests)")
    print(f"- Selenium test report: selenium_test_report.md ({selenium_tests} tests)")

if __name__ == "__main__":
    main()