export default function FormatMoney(money) {
    if (money === undefined || money === null) {
        return '$0';
    }
    const abbreviations = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd',
        'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg'
    ]
    if (money <= 0) {
        return '$0';
    }
    const index = Math.floor(Math.log10(money) / 3);
    if (index === 0) {
        if (money >= 100) {
            return `$${Math.floor(money)}`;
        } else if (money >= 10) {
            return `$${money.toFixed(1).replace(/\.0$/, '')}`;
        } else {
            return `$${money.toFixed(2).replace(/\.00$/, '').replace(/0$/, '')}`;
        }
    } else {
        const scaledMoney = money / Math.pow(1000, index);
        return `$${scaledMoney.toFixed(2)} ${abbreviations[index - 1]}`;
    }
}