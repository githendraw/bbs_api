
let message={
    register:{
        error:{
            DATA_TIDAK_ADA:"Data tidak ditemukan",
            PASSWORD_TIDAK_VALID:"Password tidak sama",
            EMAIL_TERDAFTAR:"Email Sudah Terdaftar",
            PHONE_TERDAFTAR:"No Handphone Sudah Terdaftar",
            TOKEN_VERIFICATION_INVALID:"Verifikasi token tidak di temukan / sudah expired silahkan verifikasi ulang",
            TOKEN_VERIFICATION_ACTIVATED:"User ini sudah aktif"
        }
    },
    auth:{
        login:{
            USER_NOT_FOUND:"User tidak ditemukan, silahkan register",
            USER_NOT_ACTIVE:"User belum di aktivasi , silah konfirmasi di email anda",
            USER_NOT_COMPLETE:"Silahkan lengkapi profile user anda",
            USER_NOT_MATCH:"Email/password salah"
        }
    },
    
    log:{
        register:{
            NEW_LOG:"REGISTER USER",
            NEW_ACTIVE:"USER ACTIVATED",
        },
        forget:{
            FORGET_PASSWORD:"FORGET PASSWORD",
            FORGET_PASSWORD_CONFIRM:"FORGET PASSWORD CONFIRM"
        },
        login:"USER LOGIN"
    }
}

module.exports=message;
