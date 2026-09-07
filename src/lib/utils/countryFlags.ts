export type CountryInfo = {
    code: string;
    name: string;
    flag: string;
};

function buildFlag(code: string): string {
    const normalized = code.toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";
    return String.fromCodePoint(...normalized.split("").map((char) => 127397 + char.charCodeAt(0)));
}

const RAW_COUNTRIES: Array<[string, string]> = [
    ["AD", "Andorra"], ["AE", "United Arab Emirates"], ["AF", "Afghanistan"], ["AG", "Antigua and Barbuda"],
    ["AI", "Anguilla"], ["AL", "Albania"], ["AM", "Armenia"], ["AO", "Angola"], ["AR", "Argentina"],
    ["AT", "Austria"], ["AU", "Australia"], ["AW", "Aruba"], ["AZ", "Azerbaijan"], ["BA", "Bosnia and Herzegovina"],
    ["BB", "Barbados"], ["BD", "Bangladesh"], ["BE", "Belgium"], ["BF", "Burkina Faso"], ["BG", "Bulgaria"],
    ["BH", "Bahrain"], ["BI", "Burundi"], ["BJ", "Benin"], ["BM", "Bermuda"], ["BN", "Brunei"],
    ["BO", "Bolivia"], ["BR", "Brazil"], ["BS", "Bahamas"], ["BT", "Bhutan"], ["BW", "Botswana"],
    ["BY", "Belarus"], ["BZ", "Belize"], ["CA", "Canada"], ["CD", "Democratic Republic of the Congo"],
    ["CG", "Republic of the Congo"], ["CH", "Switzerland"], ["CI", "Ivory Coast"], ["CL", "Chile"],
    ["CM", "Cameroon"], ["CN", "China"], ["CO", "Colombia"], ["CR", "Costa Rica"], ["CU", "Cuba"],
    ["CV", "Cape Verde"], ["CY", "Cyprus"], ["CZ", "Czechia"], ["DE", "Germany"], ["DJ", "Djibouti"],
    ["DK", "Denmark"], ["DM", "Dominica"], ["DO", "Dominican Republic"], ["DZ", "Algeria"], ["EC", "Ecuador"],
    ["EE", "Estonia"], ["EG", "Egypt"], ["ER", "Eritrea"], ["ES", "Spain"], ["ET", "Ethiopia"],
    ["FI", "Finland"], ["FJ", "Fiji"], ["FM", "Micronesia"], ["FO", "Faroe Islands"], ["FR", "France"],
    ["GA", "Gabon"], ["GB", "United Kingdom"], ["GD", "Grenada"], ["GE", "Georgia"], ["GH", "Ghana"],
    ["GI", "Gibraltar"], ["GL", "Greenland"], ["GM", "Gambia"], ["GN", "Guinea"], ["GQ", "Equatorial Guinea"],
    ["GR", "Greece"], ["GT", "Guatemala"], ["GW", "Guinea-Bissau"], ["GY", "Guyana"], ["HK", "Hong Kong"],
    ["HN", "Honduras"], ["HR", "Croatia"], ["HT", "Haiti"], ["HU", "Hungary"], ["ID", "Indonesia"],
    ["IE", "Ireland"], ["IL", "Israel"], ["IN", "India"], ["IQ", "Iraq"], ["IR", "Iran"], ["IS", "Iceland"],
    ["IT", "Italy"], ["JM", "Jamaica"], ["JO", "Jordan"], ["JP", "Japan"], ["KE", "Kenya"], ["KG", "Kyrgyzstan"],
    ["KH", "Cambodia"], ["KI", "Kiribati"], ["KM", "Comoros"], ["KN", "Saint Kitts and Nevis"], ["KP", "North Korea"],
    ["KR", "South Korea"], ["KW", "Kuwait"], ["KZ", "Kazakhstan"], ["LA", "Laos"], ["LB", "Lebanon"],
    ["LC", "Saint Lucia"], ["LI", "Liechtenstein"], ["LK", "Sri Lanka"], ["LR", "Liberia"], ["LS", "Lesotho"],
    ["LT", "Lithuania"], ["LU", "Luxembourg"], ["LV", "Latvia"], ["LY", "Libya"], ["MA", "Morocco"],
    ["MC", "Monaco"], ["MD", "Moldova"], ["ME", "Montenegro"], ["MG", "Madagascar"], ["MK", "North Macedonia"],
    ["ML", "Mali"], ["MM", "Myanmar"], ["MN", "Mongolia"], ["MR", "Mauritania"], ["MT", "Malta"],
    ["MU", "Mauritius"], ["MV", "Maldives"], ["MW", "Malawi"], ["MX", "Mexico"], ["MY", "Malaysia"],
    ["MZ", "Mozambique"], ["NA", "Namibia"], ["NE", "Niger"], ["NG", "Nigeria"], ["NI", "Nicaragua"],
    ["NL", "Netherlands"], ["NO", "Norway"], ["NP", "Nepal"], ["NZ", "New Zealand"], ["OM", "Oman"],
    ["PA", "Panama"], ["PE", "Peru"], ["PG", "Papua New Guinea"], ["PH", "Philippines"], ["PK", "Pakistan"],
    ["PL", "Poland"], ["PT", "Portugal"], ["PY", "Paraguay"], ["QA", "Qatar"], ["RO", "Romania"],
    ["RS", "Serbia"], ["RU", "Russia"], ["RW", "Rwanda"], ["SA", "Saudi Arabia"], ["SB", "Solomon Islands"],
    ["SC", "Seychelles"], ["SD", "Sudan"], ["SE", "Sweden"], ["SG", "Singapore"], ["SI", "Slovenia"],
    ["SK", "Slovakia"], ["SL", "Sierra Leone"], ["SM", "San Marino"], ["SN", "Senegal"], ["SO", "Somalia"],
    ["SR", "Suriname"], ["SS", "South Sudan"], ["ST", "Sao Tome and Principe"], ["SV", "El Salvador"],
    ["SY", "Syria"], ["SZ", "Eswatini"], ["TD", "Chad"], ["TG", "Togo"], ["TH", "Thailand"],
    ["TJ", "Tajikistan"], ["TL", "Timor-Leste"], ["TM", "Turkmenistan"], ["TN", "Tunisia"], ["TO", "Tonga"],
    ["TR", "Turkey"], ["TT", "Trinidad and Tobago"], ["TV", "Tuvalu"], ["TW", "Taiwan"], ["TZ", "Tanzania"],
    ["UA", "Ukraine"], ["UG", "Uganda"], ["US", "United States"], ["UY", "Uruguay"], ["UZ", "Uzbekistan"],
    ["VA", "Vatican City"], ["VC", "Saint Vincent and the Grenadines"], ["VE", "Venezuela"], ["VN", "Vietnam"],
    ["VU", "Vanuatu"], ["WS", "Samoa"], ["XK", "Kosovo"], ["YE", "Yemen"], ["ZA", "South Africa"],
    ["ZM", "Zambia"], ["ZW", "Zimbabwe"],
];

export const COUNTRIES: CountryInfo[] = RAW_COUNTRIES.map(([code, name]) => ({
    code,
    name,
    flag: buildFlag(code),
}));

const COUNTRY_MAP = new Map(CODES_TO_MAP());

function CODES_TO_MAP(): Array<[string, CountryInfo]> {
    return COUNTRIES.map((country) => [country.code, country]);
}

export function flagEmoji(countryCode: string | null | undefined): string {
    if (!countryCode) return "🌐";
    return buildFlag(countryCode);
}

export function countryName(countryCode: string | null | undefined): string {
    if (!countryCode) return "Unassigned";
    return COUNTRY_MAP.get(countryCode.toUpperCase())?.name ?? countryCode;
}

export function findCountry(code: string | null | undefined): CountryInfo | null {
    if (!code) return null;
    return COUNTRY_MAP.get(code.toUpperCase()) ?? null;
}
