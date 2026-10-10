const ThreadsModel = require('../database/models/threads');
class ThreadsController {
  constructor(v1) {
    this.api = v1;
  }
  async ['getInfo'](v2) {
    try {
      const v3 = await this.api.getThreadInfo(v2);
      if (v3)
        await ThreadsModel.setName(v2, v3.threadName || v3.name || '');
      return v3;
    } catch {
      return null;
    }
  }
  async ['get'](v4) {
    return ThreadsModel.get(v4);
  }
  async ['create'](v5, v6 = '') {
    return ThreadsModel.create(v5, v6);
  }
  async ['update'](v7, v8) {
    return ThreadsModel.update(v7, v8);
  }
  async ['approve'](v9) {
    return ThreadsModel.approve(v9);
  }
  async ['unapprove'](v10) {
    return ThreadsModel.unapprove(v10);
  }
  async ['isApproved'](v11) {
    return ThreadsModel.isApproved(v11);
  }
  async ['ban'](v12, v13 = '') {
    return ThreadsModel.ban(v12, v13);
  }
  async ['unban'](v14) {
    return ThreadsModel.unban(v14);
  }
  async ['isBanned'](v15) {
    return ThreadsModel.isBanned(v15);
  }
  async ['getAll']() {
    return ThreadsModel.getAll();
  }
  async ['getApproved']() {
    return ThreadsModel.getApproved();
  }
  async ['getBanned']() {
    return ThreadsModel.getBanned();
  }
  async ['getSettings'](v16) {
    return ThreadsModel.getSettings(v16);
  }
  async ['setSettings'](v17, v18) {
    return ThreadsModel.setSettings(v17, v18);
  }
  async ['setSetting'](v19, v20, v21) {
    return ThreadsModel.setSettings(v19, { [v20]: v21 });
  }
  async ['getData'](v22) {
    return ThreadsModel.getData(v22);
  }
  async ['setData'](v23, v24) {
    return ThreadsModel.setData(v23, v24);
  }
  async ['delete'](v25) {
    return ThreadsModel.delete(v25);
  }
}
module.exports = ThreadsController;