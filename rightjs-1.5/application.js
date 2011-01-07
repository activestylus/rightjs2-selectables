$ext(Selectable.Options, {
   fxName: null,
   multi: false
});

var MySelectable = new Class(Selectable, {
  extend: {
    Options: Object.merge(Selectable.Options, {fxName: null, multiple: false})
  },
  select: function(item) {
    var link = item.tagName == 'A' ? item : item.first ? item.first('A') : null;
    if (link) {
      document.location.href = link.href;
    } else {
      return this.$super(item);
    }
  }
});

var View = new Class({
  initialize: function() {
    this.watchMultiSelects();
    this.watchSelects();
  },

  watchSelects: function() {
    var view = this
    $$('.select select').each(function(select) {
      if(select.id != 'job_occupation_list') {
        new Selectable(select);
      }
    });
    if ($('job_actions') != null) {
      new MySelectable('job_actions');
    }
    job_category = $('job_category');
    if(job_category == null)
      job_category = $('order_job_attributes_category');
    if (job_category != null) {
      select = document.getElementById('filter_occupations');
      selected = '';
      if(select != null) {
        count = 0;
        for(i = 0; i < select.options.length; i++) {
          if(select.options[i].selected) {
            selected[count] = select.options[i];
            selected += 'selected[]=' + encodeURIComponent(select.options[i].value) + '&';
            count++;
          }
        }
      }
      var selectable = new Selectable(job_category.id, {
        fxName: null,
        onChange: function(e) {
          model = $('industry_list').get('class');
          var xhr = Xhr.load('/occupations?model='+ encodeURIComponent(model) + '&category=' + encodeURIComponent(this.value) + '&' + selected, {
            onSuccess: function(request) {
              $('industry_list').clean();
              $('industry_list').update(request.responseText);
              if (model == 'job') {
                window.occupation_select = view.watchMultiSelect($('job_occupation_list'));
              } else if(model == 'order') {
                $('industry_list').update(request.responseText);
                window.occupation_select = view.watchMultiSelect($('order_job_attributes_occupation_list'));
              }
              else {
                window.occupation_select = view.watchMultiSelect($('filter_occupations'));
              }
            }
          });
          xhr.getHeader = function() { return 'text/html'; };
        }
      });
    }
  },

  watchMultiSelects: function() {
    var industry_select = this.watchMultiSelect($('job_industry_list'));
    window.occupation_select = this.watchMultiSelect($('job_occupation_list'));
    this.watchMultiSelect($('filter_industries'));
    this.watchMultiSelect($('account_industry_list'));
  },

  watchMultiSelect: function(select) {
    selectable = new Selectable(select, {
      limit: 3,
      onSelect: function(keys) {
        this.mapEnabled(keys).each(function(item) {
          var a     = $E('a', { href: '#', html: '&times;', item: item });
          var span  = $E('span', { html: item.innerHTML });
          var div   = select.parent('.multi');
          item.link = a.onClick(this.unselect.bind(this, item)).onClick('stopEvent');
          div.insert(span.insert(item.link));
        }, this);
      },
      onUnselect: function(keys) {
       this.mapEnabled(keys).each(function(item) {
         if (item.link) {
           item.link.parent().remove();
           item.link = null;
         }
       });
      }
    });
    return selectable;
  }
});

document.on('ready', function() { new View() });