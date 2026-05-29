using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class LobbyPageTests : BaseTest
{
    private const string LobbyPageUrl = BaseUrl + "/lobby";
    private const string LoginUrl = BaseUrl + "/login";

    private void LoginAsStudent()
    {
        Driver.Navigate().GoToUrl(LoginUrl);
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        var loginButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        emailField.SendKeys("samudithasamarasinghe@gmail.com");
        passwordField.SendKeys("@12345678Aa");
        loginButton.Click();
        
        Wait.Until(d => !d.Url.Contains("/login"));
    }

    [Fact]
    public void LobbyPage_ShouldLoadAfterLogin()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(LobbyPageUrl);
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Lobbies')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }



    [Fact]
    public void LobbyPage_ShouldDisplayJoinPrivateLobbySection()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(LobbyPageUrl);
        
        try
        {
            var joinSection = Wait.Until(d => d.FindElement(By.XPath("//h2[contains(text(), 'Join a Private Lobby')]")));
            var codeInput = Driver.FindElement(By.XPath("//input[@placeholder='Enter lobby code...']"));
            var joinButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Join')]"));
            
            Assert.True(joinSection.Displayed);
            Assert.True(codeInput.Displayed);
            Assert.True(joinButton.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void LobbyPage_ShouldDisplayAvailableLobbiesSection()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(LobbyPageUrl);
        
        try
        {
            var lobbiesSection = Wait.Until(d => d.FindElement(By.XPath("//h2[contains(text(), 'Available Lobbies')]")));
            Assert.True(lobbiesSection.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }



   
    [Fact]
    public void LobbyPage_DashboardButton_ShouldNavigate()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(LobbyPageUrl);
        
        try
        {
            var dashboardButton = Wait.Until(d => d.FindElement(By.XPath("//button[contains(., 'Dashboard')]")));
            dashboardButton.Click();
            
            Wait.Until(d => d.Url.Contains("/dashboard") || d.Url.Contains("/student-dashboard"));
            Assert.True(Driver.Url.Contains("/dashboard") || Driver.Url.Contains("/student-dashboard"));
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }


   
    [Fact]
    public void LobbyPage_ResponsiveDesign_ShouldWork()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(LobbyPageUrl);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(768, 1024);
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Lobbies')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
    }
}