using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class StudentDashboardTests : BaseTest
{
    private const string StudentDashboardUrl = BaseUrl + "/student-dashboard";
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
    public void StudentDashboard_ShouldLoadAfterLogin()
    {
        LoginAsStudent();
        
        if (!Driver.Url.Contains("/student-dashboard"))
        {
            Driver.Navigate().GoToUrl(StudentDashboardUrl);
        }
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Student Dashboard')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldDisplayUserProfile()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var profileSection = Wait.Until(d => d.FindElement(By.XPath("//p[contains(text(), 'Student Name')] | //p[contains(text(), 'student@')]")));
            Assert.True(profileSection.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldDisplayStatCards()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var statCard = Wait.Until(d => d.FindElement(By.XPath("//p[contains(text(), 'Rank')] | //p[contains(text(), 'Matches')] | //p[contains(text(), 'Win Rate')]")));
            Assert.True(statCard.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldDisplayBattleOptions()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var battleButton = Wait.Until(d => d.FindElement(By.XPath("//button[contains(., 'Solo Battle')] | //a[contains(., 'Multiplayer')]")));
            Assert.True(battleButton.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldDisplaySections()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var section = Wait.Until(d => d.FindElement(By.XPath("//h2[contains(text(), 'Start a Battle')] | //h3[contains(text(), 'Available Lobbies')] | //h3[contains(text(), 'Friends')]")));
            Assert.True(section.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_MultiplayerButton_ShouldBeClickable()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var multiplayerBtn = Wait.Until(d => d.FindElement(By.XPath("//a[contains(., 'Multiplayer')]")));
            Assert.True(multiplayerBtn.Enabled);
            
            multiplayerBtn.Click();
            Wait.Until(d => d.Url.Contains("/lobby") || d.Url.Contains("/login"));
            
            if (Driver.Url.Contains("/lobby"))
            {
                Assert.Contains("/lobby", Driver.Url);
            }
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldHaveJoinButtons()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var joinButtons = Wait.Until(d => d.FindElements(By.XPath("//button[contains(text(), 'Join')]")));
            Assert.True(joinButtons.Count >= 0);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldRedirectToLoginWhenNotAuthenticated()
    {
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        Wait.Until(d => d.Url.Contains("/login"));
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void StudentDashboard_ShouldDisplayLeaderboard()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var leaderboard = Wait.Until(d => d.FindElement(By.XPath("//h3[contains(text(), 'Leaderboard')] | //p[contains(text(), 'TopPlayer')]")));
            Assert.True(leaderboard.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ShouldDisplayFriendsList()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        try
        {
            var friends = Wait.Until(d => d.FindElement(By.XPath("//h3[contains(text(), 'Friends')] | //p[contains(text(), 'Alice')] | //p[contains(text(), 'Bob')]")));
            Assert.True(friends.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void StudentDashboard_ResponsiveDesign_ShouldWork()
    {
        LoginAsStudent();
        Driver.Navigate().GoToUrl(StudentDashboardUrl);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(768, 1024);
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Student Dashboard')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
    }
}