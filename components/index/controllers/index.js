'use strict';

let exported = {
  index: function(component) {
    let req = component.req;

    return bolt.getDoc({
      query: {path: bolt.getPathFromRequest(req)}, req
    }).then(doc=>{
      if (!doc) {
        throw "Document not found in Database";
      }

      component.template = ((doc.view && req.app.templates[doc.view]) ? doc.view : 'index');
      req.doc = doc;
      component.done = true;

      return component;
    });
  }
};

module.exports = exported;