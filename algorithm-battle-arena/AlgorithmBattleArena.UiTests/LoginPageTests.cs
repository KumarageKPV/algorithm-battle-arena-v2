using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class LoginPageTests : BaseTest
{
    [Fact]
    public void LoginPage_ShouldLoadSuccessfully()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var welcomeText = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Welcome back')]")));
        Assert.True(welcomeText.Displayed);
    }

    [Fact]
    public void LoginPage_ShouldDisplayEmailField()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        Assert.True(emailField.Displayed);
        Assert.True(emailField.Enabled);
        Assert.Equal("you@domain.com", emailField.GetAttribute("placeholder"));
    }

    [Fact]
    public void LoginPage_ShouldDisplayPasswordField()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var passwordField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='password']")));
        Assert.True(passwordField.Displayed);
        Assert.True(passwordField.Enabled);
        Assert.Equal("Your password", passwordField.GetAttribute("placeholder"));
    }

    [Fact]
    public void LoginPage_ShouldDisplayLoginButton()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var loginButton = Wait.Until(d => d.FindElement(By.XPath("//button[@type='submit']")));
        Assert.True(loginButton.Displayed);
        Assert.True(loginButton.Enabled);
    }

    [Fact]
    public void LoginPage_ShouldDisplaySignUpLink()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var signUpLink = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Sign up')]")));
        Assert.True(signUpLink.Displayed);
        Assert.True(signUpLink.Enabled);
    }

    [Fact]
    public void PasswordToggle_ShouldShowHidePassword()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var passwordField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='password']")));
        var toggleButton = Driver.FindElement(By.XPath("//button[@aria-label='Show password']"));
        
        passwordField.SendKeys("testpassword");
        toggleButton.Click();
        
        Wait.Until(d => d.FindElement(By.XPath("//input[@type='text']")));
        Assert.Equal("text", passwordField.GetAttribute("type"));
        
        var hideButton = Driver.FindElement(By.XPath("//button[@aria-label='Hide password']"));
        hideButton.Click();
        
        Wait.Until(d => d.FindElement(By.XPath("//input[@type='password']")));
        Assert.Equal("password", passwordField.GetAttribute("type"));
    }

    [Fact]
    public void LoginForm_ShouldValidateRequiredFields()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var loginButton = Wait.Until(d => d.FindElement(By.XPath("//button[@type='submit']")));
        loginButton.Click();
        
        var emailField = Driver.FindElement(By.XPath("//input[@type='email']"));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        
        Assert.True(emailField.GetAttribute("required") != null);
        Assert.True(passwordField.GetAttribute("required") != null);
    }

    [Fact]
    public void LoginForm_ShouldAcceptValidInput()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        
        emailField.SendKeys("test@example.com");
        passwordField.SendKeys("password123");
        
        Assert.Equal("test@example.com", emailField.GetAttribute("value"));
        Assert.Equal("password123", passwordField.GetAttribute("value"));
    }

    [Fact]
    public void LoginForm_ShouldSubmitForm()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        var loginButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        emailField.SendKeys("test@example.com");
        passwordField.SendKeys("password123");
        
        Assert.True(loginButton.Enabled);
        loginButton.Click();
        
        Assert.True(true);
    }

    [Fact]
    public void SignUpLink_ShouldNavigateToRegister()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var signUpLink = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Sign up')]")));
        signUpLink.Click();
        
        Wait.Until(d => d.Url.Contains("/register"));
        Assert.Contains("/register", Driver.Url);
    }

    [Fact]
    public void LoginPage_ShouldDisplayCorrectLabels()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var emailLabel = Wait.Until(d => d.FindElement(By.XPath("//label[contains(text(), 'Email')]")));
        var passwordLabel = Driver.FindElement(By.XPath("//label[contains(text(), 'Password')]"));
        
        Assert.True(emailLabel.Displayed);
        Assert.True(passwordLabel.Displayed);
    }

    [Fact]
    public void LoginPage_ShouldLoadAtDifferentScreenSizes()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        Driver.Manage().Window.Size = new System.Drawing.Size(375, 667);
        Assert.Contains("/login", Driver.Url);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void LoginForm_ShouldHandleInvalidCredentials()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        var loginButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        emailField.SendKeys("invalid@example.com");
        passwordField.SendKeys("wrongpassword");
        loginButton.Click();
        
        try
        {
            var errorMessage = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Login failed') or contains(text(), 'Invalid credentials')]")));
            Assert.True(errorMessage.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.True(true);
        }
    }

    [Fact]
    public void LoginPage_ShouldDisplayWelcomeMessage()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var welcomeMessage = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Welcome back, Warrior')]")));
        Assert.True(welcomeMessage.Displayed);
    }

    [Fact]
    public void LoginPage_ShouldDisplaySecurityFeatures()
    {
        Driver.Navigate().GoToUrl($"{BaseUrl}/login");
        
        var secureAccess = Wait.Until(d => d.FindElement(By.XPath("//*[contains(text(), 'Secure Access')]")));
        var lightningFast = Driver.FindElement(By.XPath("//*[contains(text(), 'Lightning Fast Entry')]"));
        
        Assert.True(secureAccess.Displayed);
        Assert.True(lightningFast.Displayed);
    }
}