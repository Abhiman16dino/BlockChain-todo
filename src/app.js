App = {
    contracts : {},
    loadinf : false,
    load: async () => {
        // Load app...
        console.log("app loading...")
        await App.loadWeb3()
        await App.loadAcount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      },

    loadAcount: async () => {
        App.accounts = await web3.eth.accounts[0];
        console.log(App.accounts)
    },

    loadContract: async () => {
        const todolist = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todolist);
        App.contracts.TodoList.setProvider(App.web3Provider);
        console.log(todolist);

        App.todoList = await App.contracts.TodoList.deployed();
    },

    render: async () => {
        if(App.loading){
            return
        }

        App.setLoading(true);
        $('#account').html(App.accounts);

        await App.renderTasks();
        App.setLoading(false);
    },

    renderTasks: async () => {
        const taskCount = await App.todoList.taskCount();
        const $taskTemplate = $('.taskTemplate')

        for(var i = 1; i <= taskCount; i++){
            const task = await App.todoList.tasks(i);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];

            // Create html for the task
            const $newTaskTemplate = $taskTemplate.clone();
            $newTaskTemplate.find('.content').html(taskContent);
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted);

            if(taskCompleted){
                $('#completedTaskList').append($newTaskTemplate);
            } else {
                $('#taskList').append($newTaskTemplate);
            }

            // show task
            $newTaskTemplate.show()
        }
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if(boolean){
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}


$(() => {
    $(window).load(() => {
        App.load()
    })
})