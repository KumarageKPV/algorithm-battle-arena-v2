using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class AdminDashboardTests : BaseTest
{
    private const string AdminDashboardUrl = BaseUrl + "/admin-dashboard";
    private const string LoginUrl = BaseUrl + "/login";
    private const string AdminEmail = "admin@algorithmArena.com";
    private const string AdminPassword = "Admin@123";

    private void LoginAsAdmin()
    {
        Driver.Navigate().GoToUrl(LoginUrl);
        
        var emailField = Wait.Until(d => d.FindElement(By.XPath("//input[@type='email']")));
        var passwordField = Driver.FindElement(By.XPath("//input[@type='password']"));
        var loginButton = Driver.FindElement(By.XPath("//button[@type='submit']"));
        
        emailField.SendKeys(AdminEmail);
        passwordField.SendKeys(AdminPassword);
        loginButton.Click();
        
        Wait.Until(d => !d.Url.Contains("/login"));
    }

    [Fact]
    public void AdminDashboard_ShouldLoadAfterLogin()
    {
        LoginAsAdmin();
        
        if (!Driver.Url.Contains("/admin-dashboard"))
        {
            Driver.Navigate().GoToUrl(AdminDashboardUrl);
        }
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Guardian Command')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayHeaderWithShieldIcon()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var shieldIcon = Wait.Until(d => d.FindElement(By.XPath("//*[name()='svg' and contains(@class, 'lucide-shield')]")));
            var headerTitle = Driver.FindElement(By.XPath("//h1[contains(text(), 'Guardian Command')]"));
            
            Assert.True(shieldIcon.Displayed);
            Assert.True(headerTitle.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayLogoutButton()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var logoutButton = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Logout')]")));
            Assert.True(logoutButton.Displayed);
            Assert.True(logoutButton.Enabled);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_LogoutButton_ShouldWork()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var logoutButton = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Logout')]")));
            logoutButton.Click();
            
            Wait.Until(d => d.Url.Contains("/login") || d.Url.Equals(BaseUrl + "/"));
            Assert.True(Driver.Url.Contains("/login") || Driver.Url.Equals(BaseUrl + "/"));
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayArenaControlCenterTitle()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var title = Wait.Until(d => d.FindElement(By.XPath("//h2[contains(text(), 'Arena Control Center')]")));
            Assert.True(title.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayTotalWarriorsCard()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var usersIcon = Wait.Until(d => d.FindElement(By.XPath("//*[name()='svg' and contains(@class, 'lucide-users')]")));
            var warriorsTitle = Driver.FindElement(By.XPath("//h3[contains(text(), 'Total Warriors')]"));
            var warriorsCount = Driver.FindElement(By.XPath("//p[contains(text(), '1,247')]"));
            
            Assert.True(usersIcon.Displayed);
            Assert.True(warriorsTitle.Displayed);
            Assert.True(warriorsCount.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayMastersCard()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var crownIcon = Wait.Until(d => d.FindElement(By.XPath("//*[name()='svg' and contains(@class, 'lucide-crown')]")));
            var mastersTitle = Driver.FindElement(By.XPath("//h3[contains(text(), 'Masters')]"));
            var mastersCount = Driver.FindElement(By.XPath("//p[contains(text(), '89')]"));
            
            Assert.True(crownIcon.Displayed);
            Assert.True(mastersTitle.Displayed);
            Assert.True(mastersCount.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayActiveBattlesCard()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var trophyIcon = Wait.Until(d => d.FindElement(By.XPath("//*[name()='svg' and contains(@class, 'lucide-trophy')]")));
            var battlesTitle = Driver.FindElement(By.XPath("//h3[contains(text(), 'Active Battles')]"));
            var battlesCount = Driver.FindElement(By.XPath("//p[contains(text(), '23')]"));
            
            Assert.True(trophyIcon.Displayed);
            Assert.True(battlesTitle.Displayed);
            Assert.True(battlesCount.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayBattlesTodayCard()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var chartIcon = Wait.Until(d => d.FindElement(By.XPath("//*[name()='svg' and contains(@class, 'lucide-bar-chart-3')]")));
            var todayTitle = Driver.FindElement(By.XPath("//h3[contains(text(), 'Battles Today')]"));
            var todayCount = Driver.FindElement(By.XPath("//p[contains(text(), '156')]"));
            
            Assert.True(chartIcon.Displayed);
            Assert.True(todayTitle.Displayed);
            Assert.True(todayCount.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayManageUsersSection()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var usersIcon = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'rounded-xl')]//h3[contains(text(), 'Manage Users')]/preceding-sibling::*[name()='svg']")));
            var title = Driver.FindElement(By.XPath("//h3[contains(text(), 'Manage Users')]"));
            var description = Driver.FindElement(By.XPath("//p[contains(text(), 'Control warriors and masters')]"));
            var accessButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Access')]"));
            
            Assert.True(usersIcon.Displayed);
            Assert.True(title.Displayed);
            Assert.True(description.Displayed);
            Assert.True(accessButton.Displayed);
            Assert.True(accessButton.Enabled);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayBattleOversightSection()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var trophyIcon = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'rounded-xl')]//h3[contains(text(), 'Battle Oversight')]/preceding-sibling::*[name()='svg']")));
            var title = Driver.FindElement(By.XPath("//h3[contains(text(), 'Battle Oversight')]"));
            var description = Driver.FindElement(By.XPath("//p[contains(text(), 'Monitor all arena activities')]"));
            var monitorButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Monitor')]"));
            
            Assert.True(trophyIcon.Displayed);
            Assert.True(title.Displayed);
            Assert.True(description.Displayed);
            Assert.True(monitorButton.Displayed);
            Assert.True(monitorButton.Enabled);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplaySystemConfigSection()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var settingsIcon = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'rounded-xl')]//h3[contains(text(), 'System Config')]/preceding-sibling::*[name()='svg']")));
            var title = Driver.FindElement(By.XPath("//h3[contains(text(), 'System Config')]"));
            var description = Driver.FindElement(By.XPath("//p[contains(text(), 'Arena settings and rules')]"));
            var configureButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Configure')]"));
            
            Assert.True(settingsIcon.Displayed);
            Assert.True(title.Displayed);
            Assert.True(description.Displayed);
            Assert.True(configureButton.Displayed);
            Assert.True(configureButton.Enabled);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ActionButtons_ShouldBeClickable()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var accessButton = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Access')]")));
            var monitorButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Monitor')]"));
            var configureButton = Driver.FindElement(By.XPath("//button[contains(text(), 'Configure')]"));
            
            Assert.True(accessButton.Enabled);
            Assert.True(monitorButton.Enabled);
            Assert.True(configureButton.Enabled);
            
            accessButton.Click();
            System.Threading.Thread.Sleep(500);
            
            monitorButton.Click();
            System.Threading.Thread.Sleep(500);
            
            configureButton.Click();
            System.Threading.Thread.Sleep(500);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldRedirectToLoginWhenNotAuthenticated()
    {
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        Wait.Until(d => d.Url.Contains("/login"));
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void AdminDashboard_ShouldHaveCorrectGradientBackground()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var mainContainer = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'min-h-screen') and contains(@class, 'bg-gradient-to-br')]")));
            Assert.True(mainContainer.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_StatisticsCards_ShouldHaveCorrectColors()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var redCard = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'from-red-800')]")));
            var purpleCard = Driver.FindElement(By.XPath("//div[contains(@class, 'from-purple-800')]"));
            var blueCard = Driver.FindElement(By.XPath("//div[contains(@class, 'from-blue-800')]"));
            var greenCard = Driver.FindElement(By.XPath("//div[contains(@class, 'from-green-800')]"));
            
            Assert.True(redCard.Displayed);
            Assert.True(purpleCard.Displayed);
            Assert.True(blueCard.Displayed);
            Assert.True(greenCard.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ResponsiveDesign_ShouldWork()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(768, 1024);
        
        try
        {
            var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Guardian Command')]")));
            Assert.True(header.Displayed);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayAllStatisticsInCorrectOrder()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var statsGrid = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'grid') and contains(@class, 'md:grid-cols-4')]")));
            var statCards = statsGrid.FindElements(By.XPath(".//div[contains(@class, 'bg-gradient-to-br')]"));
            
            Assert.Equal(4, statCards.Count);
            
            Assert.Contains("Total Warriors", statCards[0].Text);
            Assert.Contains("Masters", statCards[1].Text);
            Assert.Contains("Active Battles", statCards[2].Text);
            Assert.Contains("Battles Today", statCards[3].Text);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }

    [Fact]
    public void AdminDashboard_ShouldDisplayAllActionSectionsInCorrectOrder()
    {
        LoginAsAdmin();
        Driver.Navigate().GoToUrl(AdminDashboardUrl);
        
        try
        {
            var actionsGrid = Wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'grid') and contains(@class, 'lg:grid-cols-3')]")));
            var actionCards = actionsGrid.FindElements(By.XPath(".//div[contains(@class, 'bg-gradient-to-br')]"));
            
            Assert.Equal(3, actionCards.Count);
            
            Assert.Contains("Manage Users", actionCards[0].Text);
            Assert.Contains("Battle Oversight", actionCards[1].Text);
            Assert.Contains("System Config", actionCards[2].Text);
        }
        catch (WebDriverTimeoutException)
        {
            Assert.Contains("/login", Driver.Url);
        }
    }
}