
//admin index page
exports.index = (req, res) => {
   res.render('admin_index', {
      title: 'IVR影院管理后台首页'
    })
}