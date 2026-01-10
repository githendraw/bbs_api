const models = require('../models');
const { to, ReE, ReS } = require("../utils/response");
const {Op} = require('../models/index').Sequelize;
const moment = require('moment');
module.exports.checkRule = async (req,res,next)=>{
    next();
    // return ReE(res, "User does not have permission to read app",301)
};
module.exports.company = async (req, res, next) =>{
    let id_company, err, company;
    id_company = req.params.id_company;
    [err, company] = await to(Company.findOne({where:{id:id_company}}));
    if(err) return ReE(res, "err finding company");
    if(!company) return ReE(res, "Company not found with id: "+id_company);
    let user, users_array, users;
    user = req.user;
    [err, users] = await to(company.getUsers());
    users_array = users.map(obj=>String(obj.user));
    if(!users_array.includes(String(user._id))) return ReE(res, "User does not have permission to read app with id: "+app_id);
    req.company = company;
    next();
};
module.exports.getDateBetween =  (st, ed)=> {
    var st = moment(st).add(-1, 'day').format('YYYY-MM-DD hh:mm:ss')
    var ed = moment(ed).add(1, 'day').format('YYYY-MM-DD hh:mm:ss')
    return {
        st: st,
        ed: ed
    };
}
module.exports.getFirstAndLastDate =  () =>{
    var firstDay = moment(moment().startOf('month')).add(-1, 'day').format('YYYY-MM-DD hh:mm:ss');
    var lastDay = moment(moment().endOf('month')).add(1, 'day').format('YYYY-MM-DD hh:mm:ss');
    var formatNum = moment(moment()).format('YYYYMMDD');
    return {
        fDay: firstDay,
        lDay: lastDay,
        formatNum: formatNum
    };
};
module.exports.getFirstAndLastDateYear =  ()=> {
    var firstDay = moment(moment().startOf('year')).add(-1, 'day').format('YYYY-MM-DD 00:00:00');
    var lastDay = moment(moment().endOf('year')).add(1, 'day').format('YYYY-MM-DD 00:00:00');
    return {
        fDay: firstDay,
        lDay: lastDay
    };
};
module.exports.comparer = (otherArray) => {
    return function (current) {
      return (
        otherArray.filter(function (other) {
          return other.id == current.id;
        }).length == 0
      );
    };
  };
const terbilang=(a)=>{
	var bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
	// 1 - 11
	// console.log(a);
	if (a < 12) {
		var kalimat = bilangan[a];
	}
	// 12 - 19
	else if (a < 20) {
		var kalimat = bilangan[a - 10] + ' Belas';
	}
	// 20 - 99
	else if (a < 100) {
		var utama = a / 10;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 10;
		var kalimat = bilangan[depan] + ' Puluh ' + bilangan[belakang];
	}
	// 100 - 199
	else if (a < 200) {
		var kalimat = 'Seratus ' + terbilang(a - 100);
	}
	// 200 - 999
	else if (a < 1000) {
		var utama = a / 100;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 100;
		var kalimat = bilangan[depan] + ' Ratus ' + terbilang(belakang);
	}
	// 1,000 - 1,999
	else if (a < 2000) {
		var kalimat = 'Seribu ' + terbilang(a - 1000);
	}
	// 2,000 - 9,999
	else if (a < 10000) {
		var utama = a / 1000;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 1000;
		var kalimat = bilangan[depan] + ' Ribu ' + terbilang(belakang);
	}
	// 10,000 - 99,999
	else if (a < 100000) {
		var utama = a / 100;
		var depan = parseInt(String(utama).substr(0, 2));
		var belakang = a % 1000;
		var kalimat = terbilang(depan) + ' Ribu ' + terbilang(belakang);
	}
	// 100,000 - 999,999
	else if (a < 1000000) {
		var utama = a / 1000;
		var depan = parseInt(String(utama).substr(0, 3));
		var belakang = a % 1000;
		var kalimat = terbilang(depan) + ' Ribu ' + terbilang(belakang);
	}
	// 1,000,000 - 	99,999,999
	else if (a < 100000000) {
		var utama = a / 1000000;
		var depan = parseInt(String(utama).substr(0, 4));
		var belakang = a % 1000000;
		var kalimat = terbilang(depan) + ' Juta ' + terbilang(belakang);
	} else if (a < 1000000000) {
		var utama = a / 1000000;
		var depan = parseInt(String(utama).substr(0, 4));
		var belakang = a % 1000000;
		var kalimat = terbilang(depan) + ' Juta ' + terbilang(belakang);
	} else if (a < 10000000000) {
		var utama = a / 1000000000;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 1000000000;
		var kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
	} else if (a < 100000000000) {
		var utama = a / 1000000000;
		var depan = parseInt(String(utama).substr(0, 2));
		var belakang = a % 1000000000;
		var kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
	} else if (a < 1000000000000) {
		var utama = a / 1000000000;
		var depan = parseInt(String(utama).substr(0, 3));
		var belakang = a % 1000000000;
		var kalimat = terbilang(depan) + ' Milyar ' + terbilang(belakang);
	} else if (a < 10000000000000) {
		var utama = a / 10000000000;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 10000000000;
		var kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
	} else if (a < 100000000000000) {
		var utama = a / 1000000000000;
		var depan = parseInt(String(utama).substr(0, 2));
		var belakang = a % 1000000000000;
		var kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
	} else if (a < 1000000000000000) {
		var utama = a / 1000000000000;
		var depan = parseInt(String(utama).substr(0, 3));
		var belakang = a % 1000000000000;
		var kalimat = terbilang(depan) + ' Triliun ' + terbilang(belakang);
	} else if (a < 10000000000000000) {
		var utama = a / 1000000000000000;
		var depan = parseInt(String(utama).substr(0, 1));
		var belakang = a % 1000000000000000;
		var kalimat = terbilang(depan) + ' Kuadriliun ' + terbilang(belakang);
	}
	console.log(kalimat);
	var pisah = !kalimat?0:kalimat.split(' ');
	var full = [];
	for (var i = 0; i < pisah.length; i++) {
		if (pisah[i] != "") {
			full.push(pisah[i]);
		}
	}
	return full.join(' ');
};
const filterShipment=(query)=>{
	
};
module.exports.terbilang=terbilang;
