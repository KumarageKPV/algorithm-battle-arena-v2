using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;

public class LandingPageTests : BaseTest
{
    [Fact]
    public void LandingPage_ShouldLoadSuccessfully()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        Assert.Contains("Vite + React", Driver.Title);
        var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Algorithm Battle Arena')]")));
        Assert.True(header.Displayed);
    }

    [Fact]
    public void LandingPage_ShouldDisplayMainHeading()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var mainHeading = Wait.Until(d => d.FindElement(By.XPath("//h2[contains(text(), 'Algorithm Battle Arena')]")));
        Assert.True(mainHeading.Displayed);
        Assert.Contains("Algorithm Battle Arena", mainHeading.Text);
    }

    [Fact]
    public void LandingPage_ShouldDisplayEnterArenaButton()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var enterArenaBtn = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Enter Arena')]")));
        Assert.True(enterArenaBtn.Displayed);
        Assert.True(enterArenaBtn.Enabled);
    }

    [Fact]
    public void LandingPage_ShouldDisplayBeginJourneyButton()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var beginJourneyBtn = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Begin Your Journey')]")));
        Assert.True(beginJourneyBtn.Displayed);
        Assert.True(beginJourneyBtn.Enabled);
    }

    [Fact]
    public void LandingPage_ShouldDisplayThreeRoleCards()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var studentCard = Wait.Until(d => d.FindElement(By.XPath("//h3[contains(text(), 'Students')]")));
        var teacherCard = Driver.FindElement(By.XPath("//h3[contains(text(), 'Teachers')]"));
        var adminCard = Driver.FindElement(By.XPath("//h3[contains(text(), 'Administrators')]"));
        
        Assert.True(studentCard.Displayed);
        Assert.True(teacherCard.Displayed);
        Assert.True(adminCard.Displayed);
    }

    [Fact]
    public void EnterArenaButton_ShouldNavigateToLogin()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var enterArenaBtn = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Enter Arena')]")));
        enterArenaBtn.Click();
        
        Wait.Until(d => d.Url.Contains("/login"));
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void BeginJourneyButton_ShouldNavigateToLogin()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var beginJourneyBtn = Wait.Until(d => d.FindElement(By.XPath("//button[contains(text(), 'Begin Your Journey')]")));
        beginJourneyBtn.Click();
        
        Wait.Until(d => d.Url.Contains("/login"));
        Assert.Contains("/login", Driver.Url);
    }

    [Fact]
    public void LandingPage_ShouldDisplayCorrectRoleDescriptions()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        
        var studentDesc = Wait.Until(d => d.FindElement(By.XPath("//h3[contains(text(), 'Students')]/following-sibling::p")));
        var teacherDesc = Driver.FindElement(By.XPath("//h3[contains(text(), 'Teachers')]/following-sibling::p"));
        var adminDesc = Driver.FindElement(By.XPath("//h3[contains(text(), 'Administrators')]/following-sibling::p"));
        
        Assert.Contains("coding battles", studentDesc.Text);
        Assert.Contains("Create challenges", teacherDesc.Text);
        Assert.Contains("Oversee the platform", adminDesc.Text);
    }

    [Fact]
    public void LandingPage_ShouldHaveResponsiveDesign()
    {
        Driver.Navigate().GoToUrl(BaseUrl);
        Driver.Manage().Window.Size = new System.Drawing.Size(768, 1024);
        
        var header = Wait.Until(d => d.FindElement(By.XPath("//h1[contains(text(), 'Algorithm Battle Arena')]")));
        Assert.True(header.Displayed);
        
        Driver.Manage().Window.Size = new System.Drawing.Size(1920, 1080);
    }
}