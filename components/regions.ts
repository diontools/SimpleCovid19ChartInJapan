export type Prefecture = {
    id: string
    name: string
    title: string
}

export type Region = {
    name: string
    prefectures: Prefecture[]
}

export const getPrefecture = (name: string) => {
    for (const region of regions) {
        for (const pref of region.prefectures) {
            if (pref.name === name) {
                return pref
            }
        }
    }
}

export const regions: Region[] = [
    {
        name: '北海道地方',
        prefectures: [
            { id: '01', name: 'Hokkaido', title: '北海道' },
        ]
    },
    {
        name: '東北地方',
        prefectures: [
            { id: '02', name: 'Aomori', title: '青森県' },
            { id: '03', name: 'Iwate', title: '岩手県' },
            { id: '04', name: 'Miyagi', title: '宮城県' },
            { id: '05', name: 'Akita', title: '秋田県' },
            { id: '06', name: 'Yamagata', title: '山形県' },
            { id: '07', name: 'Fukushima', title: '福島県' },
        ]
    },
    {
        name: '関東地方',
        prefectures: [
            { id: '08', name: 'Ibaraki', title: '茨城県' },
            { id: '09', name: 'Tochigi', title: '栃木県' },
            { id: '10', name: 'Gunma', title: '群馬県' },
            { id: '11', name: 'Saitama', title: '埼玉県' },
            { id: '12', name: 'Chiba', title: '千葉県' },
            { id: '13', name: 'Tokyo', title: '東京都' },
            { id: '14', name: 'Kanagawa', title: '神奈川県' },
        ]
    },
    {
        name: '中部地方',
        prefectures: [
            { id: '15', name: 'Niigata', title: '新潟県' },
            { id: '16', name: 'Toyama', title: '富山県' },
            { id: '17', name: 'Ishikawa', title: '石川県' },
            { id: '18', name: 'Fukui', title: '福井県' },
            { id: '19', name: 'Yamanashi', title: '山梨県' },
            { id: '20', name: 'Nagano', title: '長野県' },
            { id: '21', name: 'Gifu', title: '岐阜県' },
            { id: '22', name: 'Shizuoka', title: '静岡県' },
            { id: '23', name: 'Aichi', title: '愛知県' },
        ]
    },
    {
        name: '関西地方',
        prefectures: [
            { id: '24', name: 'Mie', title: '三重県' },
            { id: '25', name: 'Shiga', title: '滋賀県' },
            { id: '26', name: 'Kyoto', title: '京都府' },
            { id: '27', name: 'Osaka', title: '大阪府' },
            { id: '28', name: 'Hyogo', title: '兵庫県' },
            { id: '29', name: 'Nara', title: '奈良県' },
            { id: '30', name: 'Wakayama', title: '和歌山県' },
        ]
    },
    {
        name: '中国地方',
        prefectures: [
            { id: '31', name: 'Tottori', title: '鳥取県' },
            { id: '32', name: 'Shimane', title: '島根県' },
            { id: '33', name: 'Okayama', title: '岡山県' },
            { id: '34', name: 'Hiroshima', title: '広島県' },
            { id: '35', name: 'Yamaguchi', title: '山口県' },
        ]
    },
    {
        name: '四国地方',
        prefectures: [
            { id: '36', name: 'Tokushima', title: '徳島県' },
            { id: '37', name: 'Kagawa', title: '香川県' },
            { id: '38', name: 'Ehime', title: '愛媛県' },
            { id: '39', name: 'Kochi', title: '高知県' },
        ]
    },
    {
        name: '九州・沖縄地方',
        prefectures: [
            { id: '40', name: 'Fukuoka', title: '福岡県' },
            { id: '41', name: 'Saga', title: '佐賀県' },
            { id: '42', name: 'Nagasaki', title: '長崎県' },
            { id: '43', name: 'Kumamoto', title: '熊本県' },
            { id: '44', name: 'Oita', title: '大分県' },
            { id: '45', name: 'Miyazaki', title: '宮崎県' },
            { id: '46', name: 'Kagoshima', title: '鹿児島県' },
            { id: '47', name: 'Okinawa', title: '沖縄県' },
        ]
    },
]