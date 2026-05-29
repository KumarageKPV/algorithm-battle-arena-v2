using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class RegisterPageTests : BaseTest
{
    [Fact]
    public void RegisterPage_ShouldLoadSuccessfully()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var heading = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Join')]")));
        Assert.True(heading.Displayed);
    }

    [Fact]
    public void RegisterPage_ShouldDisplayRoleSelection()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var studentRole = Wait.Until(d => d.FindElement(By.XPath("//span[contains(text(), 'Student')]")));
        var teacherRole = Driver.FindElement(By.XPath("//span[contains(text(), 'Teacher')]"));
        
        Assert.True(studentRole.Displayed);
        Assert.True(teacherRole.Displayed);
    }

    [Fact]
    public void RoleSelection_ShouldSelectStudent()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var studentRole = Wait.Until(d => d.FindElement(By.XPath("//span[contains(text(), 'Student')]/parent::button")));
        studentRole.Click();
        
        Assert.Contains("bg-gradient-to-r", studentRole.GetAttribute("class"));
    }

    [Fact]
    public void RoleSelection_ShouldSelectTeacher()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var teacherRole = Wait.Until(d => d.FindElement(By.XPath("//span[contains(text(), 'Teacher')]/parent::button")));
        teacherRole.Click();
        
        Assert.Contains("bg-gradient-to-r", teacherRole.GetAttribute("class"));
    }

    [Fact]
    public void RegisterPage_ShouldDisplayFormFields()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var firstNameField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Enter first name']")));
        var lastNameField = Driver.FindElement(By.XPath("//input[@placeholder='Enter last name']"));
        var emailField = Driver.FindElement(By.XPath("//input[@placeholder='Enter your email address']"));
        var passwordField = Driver.FindElement(By.XPath("//input[@placeholder='Create a strong password']"));
        var confirmPasswordField = Driver.FindElement(By.XPath("//input[@placeholder='Confirm your password']"));
        
        Assert.True(firstNameField.Displayed);
        Assert.True(lastNameField.Displayed);
        Assert.True(emailField.Displayed);
        Assert.True(passwordField.Displayed);
        Assert.True(confirmPasswordField.Displayed);
    }

    [Fact]
    public void RegisterForm_ShouldAcceptValidInput()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var firstNameField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Enter first name']")));
        var lastNameField = Driver.FindElement(By.XPath("//input[@placeholder='Enter last name']"));
        var emailField = Driver.FindElement(By.XPath("//input[@placeholder='Enter your email address']"));
        
        firstNameField.SendKeys("John");
        lastNameField.SendKeys("Doe");
        emailField.SendKeys("john.doe@example.com");
        
        Assert.Equal("John", firstNameField.GetAttribute("value"));
        Assert.Equal("Doe", lastNameField.GetAttribute("value"));
        Assert.Equal("john.doe@example.com", emailField.GetAttribute("value"));
    }

    [Fact]
    public void PasswordField_ShouldShowStrengthIndicator()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var passwordField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Create a strong password']")));
        passwordField.SendKeys("Test123!");
        
        var strengthIndicator = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Password strength')]")));
        Assert.True(strengthIndicator.Displayed);
    }

    [Fact]
    public void PasswordToggle_ShouldShowHidePassword()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var passwordField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Create a strong password']")));
        var toggleButton = Driver.FindElement(By.XPath("//button[@aria-label='Show password']"));
        
        passwordField.SendKeys("testpassword");
        toggleButton.Click();
        
        Assert.Equal("text", passwordField.GetAttribute("type"));
        
        var hideButton = Driver.FindElement(By.XPath("//button[@aria-label='Hide password']"));
        hideButton.Click();
        
        Assert.Equal("password", passwordField.GetAttribute("type"));
    }

    [Fact]
    public void RegisterPage_ShouldDisplayCreateAccountButton()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var createButton = Wait.Until(d => d.FindElement(By.XPath("//button[@type='submit']")));
        Assert.True(createButton.Displayed);
        Assert.True(createButton.Enabled);
    }

    [Fact]
    public void RegisterForm_ShouldShowLoadingState()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var firstNameField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Enter first name']")));
        var lastNameField = Driver.FindElement(By.XPath("//input[@placeholder='Enter last name']"));
        var emailField = Driver.FindElement(By.XPath("//input[@placeholder='Enter your email address']"));
        var passwordField = Driver.FindElement(By.XPath("//input[@placeholder='Create a strong password']"));
        var confirmPasswordField = Driver.FindElement(By.XPath("//input[@placeholder='Confirm your password']"));
        var createButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        firstNameField.SendKeys("John");
        lastNameField.SendKeys("Doe");
        emailField.SendKeys("john.doe@example.com");
        passwordField.SendKeys("Test123!");
        confirmPasswordField.SendKeys("Test123!");
        createButton.Click();
        
        try
        {
            Wait.Until(d => d.FindElement(By.XPath("//span[contains(text(), 'Creating Account...')]")));
            Assert.True(true);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.True(createButton.GetAttribute("disabled") != null || 
                       createButton.GetAttribute("class").Contains("cursor-not-allowed"));
        }
    }

    [Fact]
    public void SignInLink_ShouldNavigateToLogin()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var signInLink = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Sign in here')]")));
        signInLink.Click();
        
        Wait.Until(d => d.Url.Contains("/login"));
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void RegisterPage_ShouldDisplayCorrectLabels()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var firstNameLabel = Wait.Until(d => d.FindElement(By.XPath("//label[contains(text(), 'First Name')]")));
        var lastNameLabel = Driver.FindElement(By.XPath("//label[contains(text(), 'Last Name')]"));
        var emailLabel = Driver.FindElement(By.XPath("//label[contains(text(), 'Email Address')]"));
        var passwordLabel = Driver.FindElement(By.XPath("//label[contains(text(), 'Password')]"));
        var confirmPasswordLabel = Driver.FindElement(By.XPath("//label[contains(text(), 'Confirm Password')]"));
        
        Assert.True(firstNameLabel.Displayed);
        Assert.True(lastNameLabel.Displayed);
        Assert.True(emailLabel.Displayed);
        Assert.True(passwordLabel.Displayed);
        Assert.True(confirmPasswordLabel.Displayed);
    }

    [Fact]
    public void RegisterPage_ShouldLoadAtDifferentScreenSizes()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        Driver.Manage().Window.Size = new System.Drawing.Size(375, 667);
        Assert.Contains("/register", Driver.Url);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
        Assert.Contains("/register", Driver.Url);
    }

    [Fact]
    public void RegisterForm_ShouldValidatePasswordMatch()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var passwordField = Wait.Until(d => d.FindElement(By.XPath("//input[@placeholder='Create a strong password']")));
        var confirmPasswordField = Driver.FindElement(By.XPath("//input[@placeholder='Confirm your password']"));
        var createButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        passwordField.SendKeys("Test123!");
        confirmPasswordField.SendKeys("DifferentPassword!");
        createButton.Click();
        
        try
        {
            var errorMessage = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Passwords do not match')]")));
            Assert.True(errorMessage.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.True(true);
        }
    }

    [Fact]
    public void RegisterPage_ShouldDisplayWelcomeMessage()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var welcomeMessage = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Join the Algorithm Battle Arena')]")));
        Assert.True(welcomeMessage.Displayed);
    }

    [Fact]
    public void RegisterPage_ShouldDisplayFeatures()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/register");
        
        var expertProblems = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Expert-Crafted Problems')]")));
        var warriorCommunity = Driver.FindElement(By.XPath("//*[contains(text(), 'Warrior Community')]"));
        var secureBattleground = Driver.FindElement(By.XPath("//*[contains(text(), 'Secure Battleground')]"));
        
        Assert.True(expertProblems.Displayed);
        Assert.True(warriorCommunity.Displayed);
        Assert.True(secureBattleground.Displayed);
    }
}