let allCountries = []

async function loadCountries() {
  const list = document.getElementById('countryList')
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,capital,languages,flags')
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error("Błędny format danych")
    }

    allCountries = data
    const names = allCountries.map(c => c.name.common).sort()
    names.forEach(name => {
      const option = document.createElement('option')
      option.value = name
      list.appendChild(option)
    })
  } catch (e) {
    console.error("Błąd ładowania krajów")
  }
}

function getCountryData(name) {
  return allCountries.find(
    c => c.name.common.toLowerCase() === name.toLowerCase()
  )
}

document.getElementById('tripForm').addEventListener('submit', async function (e) {
  e.preventDefault()

  const country = document.getElementById('country').value.trim()
  const budget = parseFloat(document.getElementById('budget').value.trim())
  const email = document.getElementById('email').value.trim()
  const resultDiv = document.getElementById('result')

  if (country.length < 2) return alert("Wpisz poprawną nazwę kraju")
  if (isNaN(budget) || budget <= 0) return alert("Budżet musi być dodatni")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Niepoprawny email")

  resultDiv.innerHTML = "Ładowanie..."
  resultDiv.style.display = "block"

  try {
    const data = getCountryData(country)
    if (!data) throw new Error("Nie znaleziono kraju")

    const currencyCode = Object.keys(data.currencies)[0]
    const capital = data.capital ? data.capital[0] : "-"
    const flag = data.flags.png
    const language = Object.values(data.languages)[0]
    const currencyName = data.currencies[currencyCode].name

    const accessKey = "08d8a76ad09f286e2665c3edaf80ac1e"
    const rateRes = await fetch(`https://api.exchangerate.host/convert?access_key=${accessKey}&from=PLN&to=${currencyCode}&amount=${budget}`)
    const rateData = await rateRes.json()

    if (!rateData.success) {
      throw new Error("Błąd pobierania kursu walut")
    }

    const converted = rateData.result.toFixed(2)

    resultDiv.innerHTML = `
      <h2>Plan podróży do ${data.name.common}</h2>
      <img src="${flag}" width="80">
      <p><strong>Stolica:</strong> ${capital}</p>
      <p><strong>Język:</strong> ${language}</p>
      <p><strong>Waluta:</strong> ${currencyName} (${currencyCode})</p>
      <p><strong>Budżet:</strong> ${budget} PLN ≈ ${converted} ${currencyCode}</p>
    `
    resultDiv.style.display = "block"
  } catch (err) {
    resultDiv.innerHTML = "Błąd podczas pobierania danych"
    resultDiv.style.display = "block"
  }
})

loadCountries()