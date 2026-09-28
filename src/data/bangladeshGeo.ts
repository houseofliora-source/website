// Bangladesh 64 Districts and Upazilas / Thanas Dataset

export interface DistrictInfo {
  id: string;
  name: string;
  division: string;
  isDhaka: boolean;
}

export const BANGLADESH_DISTRICTS: string[] = [
  'Dhaka',
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Barishal',
  'Bhola',
  'Bogura',
  'Brahmanbaria',
  'Chandpur',
  'Chattogram',
  'Chapainawabganj',
  'Chuadanga',
  'Cox\'s Bazar',
  'Cumilla',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gazipur',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jashore',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Khagrachhari',
  'Khulna',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Mymensingh',
  'Naogaon',
  'Narail',
  'Narayanganj',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rajshahi',
  'Rangamati',
  'Rangpur',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Sylhet',
  'Tangail',
  'Thakurgaon',
];

export const DISTRICT_THANAS: Record<string, string[]> = {
  'Dhaka': [
    'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
    'Bashundhara R/A', 'Motijheel', 'Badda', 'Khilgaon', 'Rampura',
    'Shantinagar', 'Malibagh', 'Moghbazar', 'Lalbagh', 'Old Dhaka',
    'Jatrabari', 'Tejgaon', 'Tejgaon Industrial Area', 'Mohakhali',
    'Cantonment', 'Pallabi', 'Kafrul', 'Demra', 'Keraniganj', 'Savar',
    'Dhamrai', 'Dohar', 'Nawabganj', 'Khilkhet', 'Dakshinkhan', 'Uttarkhan',
    'Turag', 'Shahbagh', 'New Market', 'Kalabagan', 'Hazaribagh',
    'Kamrangirchar', 'Kotwali', 'Sutrapur', 'Wari', 'Gendaria',
    'Kadamtali', 'Shyampur', 'Bangshal', 'Chawkbazar', 'Adabor',
    'Darus Salam', 'Rupnagar', 'Shah Ali', 'Sher-e-Bangla Nagar', 'Sabujbagh', 'Mugda', 'Paltan'
  ],
  'Gazipur': [
    'Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'
  ],
  'Narayanganj': [
    'Narayanganj Sadar', 'Bandar', 'Fatullah', 'Siddhirganj', 'Rupganj', 'Araihazar', 'Sonargaon'
  ],
  'Chattogram': [
    'Kotwali', 'Panchlaish', 'Chandgaon', 'Double Mooring', 'Halishahar',
    'Pahartali', 'Bayazid', 'Khulshi', 'Patenga', 'Agrabad', 'Bakolia',
    'Chawkbazar', 'EPZ', 'Karnaphuli', 'Akbar Shah', 'Anwara', 'Banshkhali',
    'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara',
    'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'
  ],
  'Sylhet': [
    'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj',
    'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj',
    'Dakshin Surma', 'Osmani Nagar'
  ],
  'Rajshahi': [
    'Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Chandrima', 'Katakhali',
    'Kashiadanga', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari',
    'Mohanpur', 'Paba', 'Puthia', 'Tanore'
  ],
  'Khulna': [
    'Khulna Sadar', 'Daulatpur', 'Khalishpur', 'Khan Jahan Ali', 'Kotwali',
    'Sonadanga', 'Harintana', 'Aranghata', 'Batiaghata', 'Dacope', 'Dumuria',
    'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'
  ],
  'Barishal': [
    'Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara',
    'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'
  ],
  'Rangpur': [
    'Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur',
    'Pirgachha', 'Pirganj', 'Taraganj'
  ],
  'Mymensingh': [
    'Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon',
    'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail',
    'Phulpur', 'Trishal', 'Tara Khanda'
  ],
  'Cumilla': [
    'Cumilla Sadar', 'Cumilla Sadar Dakshin', 'Barura', 'Brahmanpara',
    'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar',
    'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monohargonj', 'Muradnagar',
    'Nangalkot', 'Titas'
  ],
  'Cox\'s Bazar': [
    'Cox\'s Bazar Sadar', 'Chakaria', 'Maheshkhali', 'Kutubdia', 'Ramu',
    'Teknaf', 'Ukhia', 'Pekua', 'Eidgaon'
  ],
  'Bogura': [
    'Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali',
    'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur',
    'Shibganj', 'Sonatala'
  ],
  'Feni': [
    'Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi'
  ],
  'Brahmanbaria': [
    'Brahmanbaria Sadar', 'Ashuganj', 'Akhaura', 'Bancharampur', 'Bijoynagar',
    'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'
  ],
  'Noakhali': [
    'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya',
    'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'
  ],
  'Chandpur': [
    'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua',
    'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'
  ],
  'Lakshmipur': [
    'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'
  ],
  'Tangail': [
    'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail',
    'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur'
  ],
  'Kishoreganj': [
    'Kishoreganj Sadar', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna',
    'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'
  ],
  'Manikganj': [
    'Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur'
  ],
  'Munshiganj': [
    'Munshiganj Sadar', 'Tongibari', 'Sreenagar', 'Lauhajang', 'Gazaria', 'Sirajdikhan'
  ],
  'Narsingdi': [
    'Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'
  ],
  'Faridpur': [
    'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan',
    'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
  ],
  'Gopalganj': [
    'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'
  ],
  'Madaripur': [
    'Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar', 'Dasar'
  ],
  'Rajbari': [
    'Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'
  ],
  'Shariatpur': [
    'Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zanjira'
  ],
  'Jashore': [
    'Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha',
    'Keshabpur', 'Manirampur', 'Sharsha'
  ],
  'Kushtia': [
    'Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'
  ],
  'Jhenaidah': [
    'Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'
  ],
  'Satkhira': [
    'Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'
  ],
  'Bagerhat': [
    'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat',
    'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'
  ],
  'Chuadanga': [
    'Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'
  ],
  'Meherpur': [
    'Meherpur Sadar', 'Gangni', 'Mujibnagar'
  ],
  'Narail': [
    'Narail Sadar', 'Kalia', 'Lohagara'
  ],
  'Magura': [
    'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'
  ],
  'Pabna': [
    'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar',
    'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'
  ],
  'Sirajganj': [
    'Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur',
    'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'
  ],
  'Naogaon': [
    'Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda',
    'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'
  ],
  'Natore': [
    'Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'
  ],
  'Chapainawabganj': [
    'Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'
  ],
  'Joypurhat': [
    'Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'
  ],
  'Dinajpur': [
    'Dinajpur Sadar', 'Birampur', 'Birganj', 'Birol', 'Bochaganj',
    'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole',
    'Khansama', 'Nawabganj', 'Parbatipur'
  ],
  'Gaibandha': [
    'Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari',
    'Sadullapur', 'Sughatta', 'Sundarganj'
  ],
  'Kurigram': [
    'Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari',
    'Phulbari', 'Nageshwari', 'Razarhat', 'Raumari', 'Ulipur'
  ],
  'Lalmonirhat': [
    'Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'
  ],
  'Nilphamari': [
    'Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Syedpur'
  ],
  'Panchagarh': [
    'Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'
  ],
  'Thakurgaon': [
    'Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'
  ],
  'Patuakhali': [
    'Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa',
    'Kalapara', 'Mirzaganj', 'Rangabali'
  ],
  'Bhola': [
    'Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan',
    'Manpura', 'Tazumuddin'
  ],
  'Pirojpur': [
    'Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur',
    'Nesarabad (Swarupkati)', 'Indurkani'
  ],
  'Barguna': [
    'Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'
  ],
  'Jhalokati': [
    'Jhalokati Sadar', 'Kanthalia', 'Nalchity', 'Rajapur'
  ],
  'Moulvibazar': [
    'Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'
  ],
  'Habiganj': [
    'Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat',
    'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'
  ],
  'Sunamganj': [
    'Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharamapasha',
    'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'Shantiganj', 'Madhyanagar'
  ],
  'Jamalpur': [
    'Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'
  ],
  'Netrokona': [
    'Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri',
    'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala'
  ],
  'Sherpur': [
    'Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'
  ],
  'Rangamati': [
    'Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari',
    'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'
  ],
  'Khagrachhari': [
    'Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari',
    'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'
  ],
  'Bandarban': [
    'Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'
  ],
};
