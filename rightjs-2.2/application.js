Selectable.Options.fxName = null;
Selectable.Options.fxName = false;

var MySelectable = new Class(Selectable, {
  extend: {
    Options: Object.merge(Selectable.Options, {fxName: null, multiple: false})
  },
  select: function(item) {
    var link = item._.tagName == 'A' ? item : item.first ? item.first('A') : null;
    if (link) {
      $(document).location.href = link._.href;
    } else {
      return this.$super(item);
    }
  }
});

var MyMultiSelect = new Class(Selectable, {
  initialize: function(element, options) {
    this.$super(element);
    this.options.limit = 3;

    this.items().filter('hasClass', 'rui-selectable-selected')
      .each(this.buildDisplayLink, this);

    this.on({
      select: function(event) {
        this.buildDisplayLink(event.item);
      },
      unselect: function(event) {
        var item = event.item;
        if (item.link) {
          item.link.remove();
        }
      }
    });
  },

  buildDisplayLink: function(item) {
    var link  = $E('a', { href: '#', html: '&times;' });
    var span  = $E('span', { html: item.html() });

    link.remove  = function(e) {
      span.remove('fade');
    };

    item.link = link.onClick(link.remove).onClick(this.unselect.bind(this, item)).onClick(function(e){ e.stop(); });

    this.parent('.multi').insert(span.insert(item.link));
  }
});

var MyRemoteSelectable = new Class(Selectable, {
  initialize: function(element, options) {
    this.$super(element, options);

    this.onChange(function(e) {
      var model = $('industry_list').get('class');
      Xhr.load('/occupations', {
        params: {model: model, category: this.value(), selected: $('filter_occupations').value()},
        onSuccess: function() {
          $('industry_list').html(this.text);
          if (model == 'job') {
            View.occupation_select = new MyMultiSelect('job_occupation_list');
          } else if(model == 'order') {
            $('industry_list').html(this.text);
            View.occupation_select = new MyMultiSelect('order_job_attributes_occupation_list');
          } else {
            View.occupation_select = new MyMultiSelect('filter_occupations');
          }
        }
      });
    });
  }
});

var View = {
  initialize: function() {
    $$('.select select').each(function(element) {
      var id = element.get('id'), select;
      switch (id) {
        case 'job_actions':
          select = new MySelectable(id);
          break;
        case 'job_category':
        case 'order_job_attributes_category':
          select = new MyRemoteSelectable(id);
          break;
        case 'job_industry_list':
        case 'job_occupation_list':
        case 'filter_industries':
        case 'account_industry_list':
          select = new MyMultiSelect(id);
          break;
        default:
          select = new Selectable(id);
      }

      if (id === 'job_occupation_list') {
        View.occupation_select = select;
      }
    });
  }
};

$(document).on('ready', View.initialize);