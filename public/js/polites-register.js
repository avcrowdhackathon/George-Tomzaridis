$( document ).ready(function() {
    $("input[name='polites-register-idnumber']").on({
        keydown: function(e) {
          if (e.which === 32)
            return false;
        },
        change: function() {
          this.value = this.value.replace(/\s/g, "");
        }
    });


});