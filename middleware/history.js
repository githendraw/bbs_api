const models = require("../models");
const { to, ReE, ReS } = require("../utils/response");
const { Op } = require("../models/index").Sequelize;
// module.exports = async (req) => {
//     return await models.Logging.create({
//       id_company: req.decoded.company_id||null,
//       id_user: req.decoded.email||null,
//       role: req.decoded.role||null,
//       note: req.method,
//       description: JSON.stringify(req.body),
//     });
//   };

const PICKUP = async (param, user) => {
  let data = param;
  let step = "PICKUP";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  // hasil.status=statusData;
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description: data.pickup_by || null,
    company_id: user.company_id,
    usrupd: user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_pickup: true,
        is_from_pickup: true,
        last_status: hasil.status_id,
        last_status_remark: `${hasil.status_name} ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const INCOMINGWH = async (param, user) => {
  let data = param;
  let step = "INCOMING_WH";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  // hasil.status=statusData;
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description: user.name || null,
    company_id: user.company_id,
    usrupd: user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    const companyData = await models.Company.findOne({
      where: {
        company_id: user.company_id,
      },
      raw: true,
    });
    const shipmentData = await models.Shipment.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        company_id: user.company_id,
      },
      raw: true,
    });
    const hostData = await models.Destination.findOne({
      where: {
        dest_id: shipmentData.destination,
      },
      raw: true,
    });
    let dataUpd = {
      is_pickup: true,
      is_pickup_confirm: true,
      pickup_by: data.pickup_by,
      pickup_date: data.tanggal,
      is_incoming_wh: true,
      is_incoming_wh_date: data.tanggal,
      is_incoming_wh_by: user.name,
      last_status: hasil.status_id,
      last_status_remark: `${hasil.status_name} - ${hasil.description}`,
    };
    if (companyData.city_code == hostData.hub_id) {
      dataUpd.is_manifest = true;
      dataUpd.manifest_by = user.name;
      dataUpd.manifest_date = data.tanggal;
      dataUpd.is_departure = true;
      dataUpd.departure_by = user.name;
      dataUpd.departure_date = data.tanggal;
      dataUpd.is_arrive = true;
      dataUpd.arrive_by = user.name;
      dataUpd.arrive_date = data.tanggal;
    }
    await models.Shipment.update(
      {
        ...dataUpd,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
      ...dataUpd,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const MANIFEST=async(param,user)=>{
  let data = param;
  let step = 'MANIFEST_ORIGIN';
  let hasil ={};
  data&&!data.tanggal?data.tanggal = new Date():data.tanggal = data.tanggal;
  let statusData = await models.Status.findOne({where: {status_id: step,},raw: true,});
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description: `${data.manifest_id}` || null,
    company_id: user.company_id,
    usrupd: user.email,
    ref_no:data.ref_no,
    ref_id_no: data.ref_id_no,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    const companyData = await models.Company.findOne({
      where: {
        company_id: user.company_id,
      },
      raw: true,
    });
    const shipmentData = await models.Shipment.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        company_id: user.company_id,
      },
      raw: true,
    });
    const hostData = await models.Destination.findOne({
      where: {
        dest_id: shipmentData.destination,
      },
      raw: true,
    });
    let dataUpd = {
      is_manifest: true,
      manifest_by: data.name,
      manifest_date: data.tanggal,
      manifest_no: data.manifest_id,
      last_status: hasil.status_id,
      last_status_remark: `${hasil.status_name} - ${hasil.description}`,
    };
    await models.Shipment.update(
      {
        ...dataUpd,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
      ...dataUpd,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const DEPARTURE=async(param,user)=>{
  let data = param;
  let step = 'DEPARTURE';
  let hasil={};
  data&&!data.tanggal?data.tanggal = new Date():data.tanggal = data.tanggal;
  let statusData = await models.Status.findOne({where: {status_id: step,},raw: true,});
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description: `${data.assignment_id}` || null,
    company_id: user.company_id,
    usrupd: user.name,
    ref_no:data.ref_no,
    ref_id_no: data.ref_id_no,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    const companyData = await models.Company.findOne({
      where: {
        company_id: user.company_id,
      },
      raw: true,
    });
    const shipmentData = await models.Shipment.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        company_id: user.company_id,
      },
      raw: true,
    });
    let dataUpd = {
      is_manifest: true,
            is_departure: true,
            departure_by: user.name,
            departure_date: data.tanggal,
            last_status: hasil.status_id,
            last_status_remark: `${hasil.status_name} - ${hasil.description}`,
    };
    await models.Shipment.update(
      {
        ...dataUpd
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
      ...dataUpd,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const ARRIVAL = async(param,user)=>{

  console.log('ini user',user);
  let data = param;
  let step = "ARRIVE";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description:`${statusData.status_name} - ${data.assignment_id||null} - ${data.manifest_id||null}` || null,
    company_id: user.company_id,
    usrupd: user.name?user.name:user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };

  console.log('-->>>>>',hasil);
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_arrive: true,
        is_incoming_wh_by: user.name ? user.name : user.email,
        is_incoming_wh_date: data.tanggal,
        arrive_by: user.name ? user.name : user.email,
        arrive_date: data.tanggal,
        last_status: hasil.status_id,
        last_status_remark: `${hasil.status_name} ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    console.log(error);
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const DELIVERY=async(param,user)=>{
  let hasil={};
  let data = param;
  let step = "DELIVERY";
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil={
    status_id:statusData.status_id,
    status_name:statusData.status_name,
    description:`${data.name} - ${data.delivery_id}` || null,
    company_id: user.company_id,
    usrupd: user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    ref_no:data.delivery_id,
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  }
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_arrive: true,
        is_manifest: true,
        arrive_by: data.name,
            arrive_date: data.tanggal,
            is_delivery: true,
            delivery_by: data.name,
            delivery_date: data.tanggal,
            delivery_no: data.delivery_id,
            last_status:statusData.status_id,
            last_status_remark: `${statusData.status_name} - ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  }catch(error){
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const RECEIVED=async(param,user)=>{
  let data = param;
  let step = "RECEIVED_SUCCESS";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  // hasil.status=statusData;
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description: `${data.name} - ${data.delivery_id} (${data.description})` ||null,
    company_id: user.company_id,
    usrupd: user.name ? user.name : user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
    remark : data.latlng
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_received: true,
            received_status: data.description,
            received_by: data.name,
            received_date: data.tanggal,
            delivery_no: data.delivery_id,
            last_status: hasil.status_id,
            last_status_remark: `${hasil.status_name} ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const UNDEL=async(param,user)=>{
  let data = param;
  let step = "RECEIVED_FAILED";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description:`${data.name} - ${data.delivery_id} (${data.description})` ||null,
    company_id: user.company_id,
    usrupd: user.name?user.name:user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    remark: data.latlng||null,
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        delivery_by: data.name,
        delivery_date: data.tanggal,
        delivery_no: data.delivery_id,
        last_status: hasil.status_id,
        last_status_remark: `${hasil.status_name} - ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
}
const STTRETURN=async(param,user)=>{
  let data = param;
  let step = "RETURN_POD";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description:`${statusData.status_name} - ${data.stt_return_id}` || null,
    company_id: user.company_id,
    usrupd: user.name?user.name:user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    ref_no: data.stt_return_id||null,
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_return_pod: true,
        return_by: `${data.hub_id}(${user.name})`,
        return_pod_date: data.tanggal,
        return_pod_no: data.stt_return_id,
        last_status: hasil.status_id,
        last_status_remark: `${hasil.status_name} - ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const STT_RETURN_CUSTOMER=async (param,user)=>{
  let data = param;
  let step = "RETURN_CUSTOMER";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description:`${statusData.status_name} - ${data.stt_return_id} - ${data.partner_name}` || null,
    company_id: user.company_id,
    usrupd: user.name?user.name:user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    ref_no: data.stt_return_id||null,
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_return_customer: true,
        return_customer_by: `${user.name}`,
        return_customer_date: data.tanggal,
        return_customer_no: data.stt_return_id,
        last_status: hasil.status_id,
        last_status_remark: `${hasil.status_name} - ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
};
const INVOICE = async(param,user)=>{
  let data = param;
  let step = "INVOICE_CREATE";
  let hasil = {};
  if (data && !data.tanggal) {
    data.tanggal = new Date();
  } else {
    data.tanggal = data.tanggal;
  }
  let statusData = await models.Status.findOne({
    where: {
      status_id: step,
    },
    raw: true,
  });
  hasil = {
    status_id: statusData.status_id,
    status_name: statusData.status_name,
    description:`${statusData.status_name} - ${data.invoice_id}` || null,
    company_id: user.company_id,
    usrupd: user.name?user.name:user.email,
    history_date: data.tanggal,
    update_date: new Date(),
    ref_no: data.invoice_id||null,
    pic1 : data.pic1 ? data.pic1 : null,
    pic2 : data.pic2 ? data.pic2 : null,
    pic3 : data.pic3 ? data.pic3 : null,
    pic4 : data.pic4 ? data.pic4 : null,
    pic5 : data.pic5 ? data.pic5 : null,
    pic6 : data.pic6 ? data.pic6 : null,
  };
  try {
    let historyData = await models.History.findOne({
      where: {
        shipment_awb: data.shipment_awb,
        status_id: step,
      },
    });
    if (historyData) {
      await models.History.update(hasil, {
        where: {
          shipment_awb: data.shipment_awb,
          status_id: step,
        },
      });
    } else {
      hasil.shipment_awb = data.shipment_awb;
      await models.History.create(hasil);
    }
    await models.Shipment.update(
      {
        is_invoice: true,
            invoice_no: data.invoice_id,
            invoice_by: user.name ? user.name : user.email,
            invoice_date: data.tanggal,
            last_status: hasil.status_id,
            last_status_remark: `${hasil.status_name} - ${hasil.description}`,
      },
      {
        where: {
          shipment_awb: data.shipment_awb,
        },
      }
    );
    LOG({ ...hasil });
    return await Promise.resolve({
      ...hasil,
    });
  } catch (error) {
    return await Promise.reject({
      status: false,
      error: error,
    });
  }
}
const LOG = async (data) => {
  return await models.History_log.create({
    ...data,
  });
};

const LOG_POSITION = (param, user, callback) => {
  s.query(
    `SELECT
	"Contact".contact_id,
	"Contact"."name",
	"Contact_trip".pos_date,
	"Contact_trip".lat_pos,
	"Contact_trip".long_pos
    FROM
	"Contact_trip"
	INNER JOIN
	"Contact"
	ON
		"Contact_trip".contact_id = "Contact".contact_id`,
    {
      replacements: [],
      type: s.QueryTypes.SELECT,
    }
  )
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      callback(err);
    });
};
module.exports = {
  PICKUP,
  INCOMINGWH,
  MANIFEST,
  DEPARTURE,
  DELIVERY,
  ARRIVAL,
  RECEIVED,
  UNDEL,
  STTRETURN,
  STT_RETURN_CUSTOMER,
  INVOICE,
  LOG,
  LOG_POSITION
};
