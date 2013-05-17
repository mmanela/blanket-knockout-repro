/// <reference path="../common/jquery-1.7.1.js" />
/// <reference path="../common/knockout-2.1.0.js" />
/// <reference path="../common/jquery.mockjax.js" />
/// <reference path="../src" />


(function ($) {
    /// <summary>
    /// Unit test for assign viewmodel.
    /// </summary>

    module('testWebSite.UserDetailInfo');

    var userMockData = { Id: 1, UserName: 'Satya', Password: 'Rapelly', Updated: '' },
        saveMockData =  {Id:1, UserName:'Satya', Password:'Rapelly', Updated:'Success'},
        UserDetailInfo = new $.testWebSite.UserDetailInfo(),
        $container;

    var createHtml = function () {

        $container = $('<section class="view-container">\
                     <div class="search-container" id="search"> \
                        <input type="text" value ="" id="userId" /> \
                        <button id="search-button">Go</button> \
                    </div> \
                    <div> \
                        <button id="save">Save</button> \
                        <span id="saved" data-bind="text: Updated"></span> \
                    </div> \
                    <div> \
                      <article class="ui-helper-clearfix"> \
                        <section class="details"> \
                            <h3>User Details1</h3> \
                            <span class="text-span" data-bind="text: Id"></span> \
                            <input class="text-input-user-name" data-bind="value: UserName"> \
                            <input class="text-input-password" data-bind="value: Password" /> \
                    </section> \
                </article> \
                </div> \
            </section>').css('visibility', 'hidden');
            $(document.body).append($container);
            
    };

    test('Initialize', function () {
        // Arrange 
        createHtml();
        setupMockAjax();
        // Assert
        ok($container.hasClass('view-container'), 'Initialize Complete');
      
        UserDetailInfo.load();
        
        
    });

    asyncTest('GetUserDetails Test', function () {
        
        $('#userId').val('1');
        var element = $container.find('#search-button');
        element.trigger('click');

        setTimeout(function () {
            start();
            strictEqual($('.text-input-user-name').val(), userMockData.UserName, 'GetUserDetails Test Success');
        }, 500);
    });

    asyncTest('Save User Test', function () {

        $('.text-input-user-name').val('update name').change();
        var element = $container.find('#save');
        
        element.trigger('click');
        setTimeout(function () {
            start();
            ok($('#saved').val() === '', 'Before Update Test Success');
            strictEqual($('#saved').val(), userMockData.Updated, 'After Update Test Success');
        }, 500);
    });

    function setupMockAjax() {
        /// <summary>
        /// Set a Mock Ajax for the all the async calls
        /// </summary>

        $.mockjax({
            url: '*/Home/GetUserDetails',
            type: 'POST',
            responseText: userMockData
        });

        $.mockjax({
            url: '*Home/SaveUser',
            type: 'GET',
            responseText: saveMockData
        });
    }
}(jQuery));