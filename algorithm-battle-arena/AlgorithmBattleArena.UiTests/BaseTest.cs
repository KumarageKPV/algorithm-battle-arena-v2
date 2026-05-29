using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace AlgorithmBattleArena.UiTests;


public abstract class BaseTest : IDisposable
{
    protected IWebDriver Driver { get; private set; }
    protected WebDriverWait Wait { get; private set; }
    protected const string BaseUrl = "http://localhost:5173";

    protected BaseTest()
    {
        var options = new ChromeOptions();
        options.AddArgument("--no-sandbox");
        options.AddArgument("--disable-dev-shm-usage");
        options.AddArgument("--window-size=1920,1080");
        options.AddArgument($"--user-data-dir={Path.GetTempPath()}selenium_{Guid.NewGuid()}");
        // options.AddArgument("--headless"); // Uncomment for headless mode
        // options.AddArgument("--disable-web-security"); // For debugging only

        Driver = new ChromeDriver(options);
        Wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
        Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(5);
    }

    public void Dispose()
    {
        System.Threading.Thread.Sleep(2000); // 2 second delay to see test automation
        Driver?.Quit();
        Driver?.Dispose();
    }
}