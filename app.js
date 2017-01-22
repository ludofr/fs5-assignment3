(function () {
'use strict';

var module = angular.module('NarrowItDownApp', []);
module.controller('SearchMenuController', SearchMenuController);
module.service('MenuSearchService', MenuSearchService);
module.directive('foundItems', FoundItems);

////////////////////////////////////////////////////////////////

SearchMenuController.$inject = ['MenuSearchService'];
function SearchMenuController (MenuSearchService)
{
  var ctrl = this ;

  ctrl.searchString      = "";
  ctrl.researchTriggered = false ;
  ctrl.noResult          = "Nothing Found..." ;

  ctrl.search = function ()
  {
    if(ctrl.searchString != "")
    {
      var promise = MenuSearchService.sendSearchRequest();

      promise.then(function (response)
      {
        MenuSearchService.clearResults();
        MenuSearchService.filterResult(response.data , ctrl.searchString);
        ctrl.researchTriggered = true ;
      })
      .catch(function (error)
      {
        console.log("Sthg went wrong !");
        ctrl.researchTriggered = false ;
      }
      );

    }
    else
    {
      MenuSearchService.clearResults();
      ctrl.researchTriggered = false ;
    }
  };

  ctrl.foundItems = MenuSearchService.foundItems();

  ctrl.ignoreItem = function (itemIndex)
  {
    MenuSearchService.ignoreItem(itemIndex);
  };

  ctrl.isSearchEmpty = function ()
  {
      if (ctrl.researchTriggered  && MenuSearchService.matchesNumber() == 0)
      {
        return true ;
      }
      else
      {
        return false ;
      }
  };

  ctrl.isSearchSuccessful = function ()
  {
      if (ctrl.researchTriggered && MenuSearchService.matchesNumber() != 0)
      {
        return true ;
      }
      else
      {
        return false ;
      }
  };

  ctrl.matchesNumber = function ()
  {
    return MenuSearchService.matchesNumber()
  } ;


}
////////////////////////////////////////////////////////////////
MenuSearchService.$inject = ['$http'] ;
function MenuSearchService($http)
{
  var service = this ;

  var foundItemsList = [];

  service.ignoreItem = function (itemIndex)
  {
    foundItemsList.splice(itemIndex, 1);
  };

  service.foundItems = function ()
  {
     return foundItemsList ;
  };

  service.clearResults = function ()
  {
    foundItemsList.length = 0 ;
  };

  service.matchesNumber = function()
  {
    return foundItemsList.length ;
  };

  service.sendSearchRequest = function ()
  {
    var response  = $http (
      {
        method : "GET" ,
        url : ("http://davids-restaurant.herokuapp.com/menu_items.json")
      });

      return response ;

  };

  service.filterResult = function (result , searchString)
  {
    searchString = searchString.toLowerCase();

    var searchStringArray = searchString.split(" ");

    for(var idx = 0 ; idx < result.menu_items.length ; idx++)
    {
      var menuName = result.menu_items[idx].name.toLowerCase() ;

      for(var searchIdx = 0 ; searchIdx < searchStringArray.length ; searchIdx ++)
      {
        var re = new RegExp('\\b' + searchStringArray[searchIdx] + '\\b') ;

        if(menuName.match(re))
        {

          foundItemsList.push(
            {
              name        : result.menu_items[idx].name ,
              shortName   : result.menu_items[idx].short_name ,
              description : result.menu_items[idx].description
            }
          );
          break ;
        }
      }
    }
  }

}

})();
