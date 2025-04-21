let clickCount = 0;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');

function handleClick() 
{
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() 
{
    try 
    {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) 
            throw new Error('Błąd pobierania danych');

        const data = await response.json();

        const countries = data
            .map(country => country.name.common)
            .sort((a, b) => a.localeCompare(b));

        const countrySelect = $('#country');
        countrySelect.html(countries.map(country => `<option value="${country}">${country}</option>`).join(''));
        countrySelect.selectpicker('refresh');  

        const codes = data
            .filter(country => country.idd?.root && country.idd?.suffixes?.length)
            .map(country => {
                const root = country.idd.root || '';
                const suffix = country.idd.suffixes[0] || '';
                const code = root + suffix;
                const label = `${code} ${country.name.common}`;
                const name = country.name.common;
                return { code, label, name };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        const codeSelect = $('#countryCode');
        codeSelect.html(codes.map(c => `<option value="${c.code}">${c.label}</option>`).join(''));
        codeSelect.selectpicker('refresh');
    } 
    catch (error) 
    {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() 
{
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            // TODO inject country to form and call getCountryCode(country) function
            const countrySelect = $('#country');
            countrySelect.val(country);
            countrySelect.selectpicker('refresh');
            getCountryCode(country);
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) 
{
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        return response.json();
    })
    .then(data => {        
        const countryCode = data[0].idd.root + data[0].idd.suffixes.join("")
        // TODO inject countryCode to form
        const codeSelect = document.getElementById('countryCode');
        codeSelect.value = countryCode;
        $(codeSelect).selectpicker('refresh');
    })
    .catch(error => {
        console.error('Wystąpił błąd:', error);
    });
}

function fillInvoiceFromForm()
{
    const fullName = document.getElementById('firstName').value + ' ' 
        + document.getElementById('lastName').value;
    const address = document.getElementById('zipCode').value + ', ' 
        + document.getElementById('city').value + ', ' + document.getElementById('street').value;
    const phoneNumber = document.getElementById('countryCode').value + ' ' 
        + document.getElementById('phoneNumber').value;

    const result = [
        `Full Name: ${fullName}`,
        `Address: ${address}`,
        `Phone number: ${phoneNumber}`
    ].join('\n');

    const invoiceData = document.getElementById('invoiceData');
    invoiceData.value = result;
}

(async () => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    
    document.addEventListener('DOMContentLoaded', function() {
        const clicksInfo = document.getElementById('click-count');
        const vatUECheckbox = document.getElementById('vatUE');
        const invoiceData = document.getElementById('invoice-data');

        document.addEventListener('click', function handleClick() {
            clickCount++;
            clicksInfo.innerText = clickCount
        });

        vatUECheckbox.addEventListener('change', function() {
            invoiceData.hidden = !this.checked;
            fillInvoiceFromForm();
        });
    });
    
    await fetchAndFillCountries();
    getCountryByIP();  
})()
