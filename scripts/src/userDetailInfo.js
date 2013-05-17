$.testWebSite = $.testWebSite || {};

(function () {

    this.SearchView = function (categories) {
        this.categories = categories;
        this.myViewModel = {};
        this.init = function () {
            var self = this;
            this.categoryViewModel = function () {
                var me = this;
                this.items = ko.observableArray(self.categories);
                this.selectedItem = ko.observable();

                this.resetSelection = function () {
                    this.selectedItem(null);
                };

                this.searchByCategory = function () {
                    self.search(me.selectedItem() ? me.selectedItem().Id : 1);
                };

                this.setSelectedItem = function () {
                    me.selectedItem(this);
                };
            };
            ko.applyBindings(new this.categoryViewModel(), $('#search-category').get(0));
        };

        this.populate = function () {
            return $.map(this.categories, function (category) {
                return { Id: category.Id, Name: ko.observable(category.Name) };
            });
        };

        this.search = function (selectedItem) {
            var self = this,
                settings = { contentType: 'application/json', dataType: 'json', processdata: true };

            self.post('/Home/GetUserDetails', { userId: selectedItem }, settings).done(function (response) {
                self.myViewModel.Id = response.Id;
                self.myViewModel.UserName = response.UserName;
                self.myViewModel.Password = response.Password;
                ko.applyBindings(self.myViewModel, $('.details').get(0));
            }).fail(function () {
                    // custom error
            });
        };

        this.post = function (url, selectedData, settings) {

            var ajaxSettings = $.extend({ url: '' }, { url: url, type: "POST", contentType: "application/json", dataType: "json", data: JSON.stringify(selectedData), handleMessages: true }, settings);

            var ajaxDeferred = $.Deferred();

            $.ajax(ajaxSettings).done(function (response, textstatus, xhr) {
                ajaxDeferred.resolve(response);
            }).fail(function () {
                ajaxDeferred.reject();
            })
            return ajaxDeferred.promise();
        };
    };

    this.UserDetailInfo = function () {
        this.myViewModel = {};
        this.load = function () {
            this.myViewModel = {
                Id: ko.observable(1),
                UserName: ko.observable('satya'),
                Password: ko.observable('password'),
                Updated: ko.observable('')
            };

            this._setupReferences();
            this._bindInteractions();
            ko.applyBindings(this.myViewModel, $('.details').get(0));
        };

        this._setupReferences = function () {
            this._$searchButton = $('#search-button');
            this._$saveButton = $('#save');
        };

        this._bindInteractions = function () {
            var self = this;
            self._$searchButton.click(function () {
                var data = { userId: $('#userId').val() };
                self.getUserDetails(data);
            });

            self._$saveButton.click(function () {
                var data = {
                    Id: self.myViewModel.Id(),
                    UserName: self.myViewModel.UserName(),
                    Password: self.myViewModel.Password(),
                    Updated: self.myViewModel.Updated()
                };

                $.ajax({
                    type: 'POST',
                    url: '/Home/SaveUser',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    dataType: 'json',
                    processdata: true,
                    success: function (response) {
                        self.reset();
                        self.myViewModel.Updated(response.Updated);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
            });
        };

        this.reset = function () {
            $("input").val('').change();
        };
       
        this.getUserDetails = function (data) {
            var self = this;
            $.ajax({
                type: 'POST',
                url: '/Home/GetUserDetails',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                processdata: true,
                success: function (response) {
                    self.myViewModel.Id(response.Id);
                    self.myViewModel.UserName(response.UserName);
                    self.myViewModel.Password(response.Password);
                },
                error: function (jqXHR, textStatus, errorThrown) {

                }
            });
        };
    };

}).apply($.testWebSite);