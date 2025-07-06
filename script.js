class Task {
  constructor(id, descricao) {
    this.id = id;
    this.descricao = descricao;
    this.dataInicio = new Date().toLocaleDateString();
    this.dataConclusao = null;
    this.concluida = false;
  }

  concluir() {
    if (!this.concluida) {
      this.dataConclusao = new Date().toLocaleDateString();
      this.concluida = true;
    } else {
      this.dataConclusao = null;
      this.concluida = false;
    }
  }

  editar(descricao) {
    this.descricao = descricao;
  }
}

class SchedulerADS {
  constructor() {
    this.idAtual = 1;
    this.listaTarefas = [];
    this.tabelaBody = document.querySelector('#tabelaTarefas tbody');
    this.noTasksMessage = document.getElementById('noTasksMessage');
    this.modalContainer = document.getElementById('modalContainer');
    this.taskIdToDelete = null;
    this.taskIdToEdit = null;
    
    // Adicionar tarefas
    document.getElementById('adicionarBtn').addEventListener('click', () => this.adicionar())

    // Remover todas tarefas
    document.getElementById('removerTodasBtn').addEventListener('click', () => this.removerTodas());

    // Adicionar evento de clique no botão de dark mode
    document.getElementById('darkToggle').addEventListener('click', this.toggleDarkMode)

    // carrega preferência de tema
    if (localStorage.getItem('modo') === 'dark') document.body.classList.add('dark')

    this.atualizarMensagem()
  }

  // Método para alternar entre o tema claro e escuro
  toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('modo', document.body.classList.contains('dark') ? 'dark' : 'light');
  }

  // Método para atualizar a mensagem de tarefas (se no momento não houver tarefas, exibe a mensagem de "Sem tarefas adicionadas.")
  atualizarMensagem() {
    this.noTasksMessage.style.display = this.tabelaBody.children.length ? 'none' : 'block';
  }

  // Método para exibir mensagens de erro
  exibirErro(mensagem) {
    const erro = document.getElementById('errorMessage');
    erro.style.display = 'block';
    erro.textContent = mensagem;
    
    // Remove a mensagem de erro após 2 segundos
    setTimeout(() => {
      erro.style.display = 'none';
    }, 2000);
  }

  // Método para adicionar uma nova tarefa
  adicionar() {
    const descricaoInput = document.getElementById('descricaoTarefa');
    const descricao = descricaoInput.value.trim();
    descricaoInput.value = '';

    if (!descricao) {
      this.exibirErro('Por favor, insira uma descrição para a tarefa.');
      return;
    }

    const tarefa = new Task(this.idAtual, descricao);
    this.listaTarefas.push(tarefa);

    this.criarLinhaTabela(tarefa);
  }

  // Método para criar uma linha na tabela para a tarefa
  criarLinhaTabela(tarefa) {
    // Cria a linha da tabela
    const tr = document.createElement('tr')
    tr.id = `task-${tarefa.id}`
    tr.innerHTML = `
      <td>${tarefa.id}</td>
      <td>${tarefa.descricao}</td>
      <td>${tarefa.dataInicio}</td>
      <td class="status">Em andamento</td>
      <td></td>
    `

    // Cria os botões de ação
    // Botão de concluir
    const concluir = document.createElement('button')
    concluir.className = 'action-btn'
    concluir.title = 'Concluir'
    concluir.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12 3.41 13.41 9 19 21 7 19.59 5.59 9 16.17Z"/></svg>'
    concluir.addEventListener('click', () => this.marcarConcluida(tarefa.id))

    // Botão de excluir
    const excluir = document.createElement('button')
    excluir.className = 'action-btn'
    excluir.title = 'Excluir'
    excluir.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/></svg>'
    excluir.addEventListener('click', () => this.remover(tarefa.id))

    // Botão de editar
    const editar = document.createElement('button')
    editar.className = 'action-btn'
    editar.title = 'Editar'
    editar.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
    editar.addEventListener('click', () => this.editar(tarefa.id))

    // Adiciona os botões à linha da tabela
    tr.lastElementChild.append(concluir, excluir, editar)
    this.tabelaBody.appendChild(tr)

    // Incrementa o ID da tarefa
    this.idAtual++
    this.atualizarMensagem()
  }

  // Método para marcar uma tarefa como concluída ou "desconcluir" ela
  marcarConcluida(id) {
    const tarefa = this.listaTarefas.find(tarefa => tarefa.id === id)
    tarefa.concluir()

    // Seleciona a linha da tabela
    const tr = document.getElementById(`task-${id}`)
    const statusTd = tr.querySelector('.status')

    // Aplica um estilo para a tarefa concluída, ou remove-o se for desconcluida
    if (tarefa.concluida) {
      statusTd.textContent = new Date().toLocaleDateString()
      statusTd.style.color = '#90ee90'
      tr.classList.add('completed-task')
    } else {
      statusTd.textContent = 'Em andamento'
      statusTd.style.color = ''
      tr.classList.remove('completed-task')
    }
  }
  
  // Método para remover uma tarefa
  remover(id) {
    const tarefa = this.listaTarefas.find(tarefa => tarefa.id === id)
    if (tarefa.concluida) {
      this.exibirErro('Não é possível excluir uma tarefa concluída.')
      return
    }
    this.mostrarModalExclusao(id)
  }

  removerTodas() {
    this.fecharModal(); // Fecha qualquer modal aberto

    if (this.listaTarefas.length === 0) {	
      this.exibirErro('Não há tarefas para remover.')
      return;
    }

    // Exibe uma janela de confirmação antes de remover todas as tarefas
    const modal = document.createElement('div');
    modal.id = 'removeAllConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <p id="removeAllConfirmText">Tem certeza que deseja remover todas as tarefas?</p>
        <button id="confirmRemoveAllBtn" class="primary-btn">Sim, remover todas</button>
        <button id="cancelRemoveAllBtn" class="primary-btn cancel-btn">Cancelar</button>
      </div>
    `;

    // Adiciona esse modal à janela
    this.modalContainer.appendChild(modal);
    modal.style.display = 'flex'; // Faz ele aparecer
    document.getElementById('confirmRemoveAllBtn').onclick = () => {
      this.tabelaBody.innerHTML = ''; // Limpa a tabela
      this.listaTarefas = []; // Limpa a lista de tarefas
      this.atualizarMensagem(); // Atualiza a mensagem de tarefas
      this.fecharModal(); // Fecha o modal
    };
  }

  // Mostra a janela de confirmação de exclusão de tarefa
  mostrarModalExclusao(id) {
    this.fecharModal(); // Fecha o modal para evitar problemas
    this.taskIdToDelete = id;
    const modal = document.createElement('div');
    modal.id = 'deleteConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <p id="deleteConfirmText">Tem certeza que deseja excluir esta tarefa?</p>
        <button id="confirmDeleteBtn" class="primary-btn">Sim, excluir</button>
        <button id="cancelDeleteBtn" class="primary-btn cancel-btn">Cancelar</button>
      </div>
    `;

    // Adiciona esse modal à janela
    this.modalContainer.appendChild(modal);
    modal.style.display = 'flex';
    document.getElementById('confirmDeleteBtn').onclick = () => this.confirmarExclusao();
    document.getElementById('cancelDeleteBtn').onclick = () => this.fecharModal();
  }

  // Mostra a janela de edição de tarefa
  mostrarModalEdicao(id) {
    this.fecharModal();
    this.taskIdToEdit = id;
    const tarefa = this.listaTarefas.find(tarefa => tarefa.id === id);
    const modal = document.createElement('div');
    modal.id = 'editTaskModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <p id="editTaskText">Editar tarefa</p>
        <input type="text" id="editTaskInput" value="${tarefa ? tarefa.descricao.replace(/"/g, '&quot;') : ''}" placeholder="Nova descrição da tarefa" />
        <div style="margin-top:1.5rem;">
          <button id="saveEditBtn" class="primary-btn">Salvar</button>
          <button id="cancelEditBtn" class="primary-btn cancel-btn">Cancelar</button>
        </div>
      </div>
    `;

    // Adiciona esse modal à janela
    this.modalContainer.appendChild(modal);
    modal.style.display = 'flex'; // Faz ele aparecer
    document.getElementById('saveEditBtn').onclick = () => this.confirmarEdicao();
    document.getElementById('cancelEditBtn').onclick = () => this.fecharModal();
    setTimeout(() => document.getElementById('editTaskInput').focus(), 100);
  }

  // Fecha qualquer janela de confirmação
  fecharModal() {
    this.modalContainer.innerHTML = '';
    this.taskIdToDelete = null;
    this.taskIdToEdit = null;
  }

  // Confirma a exclisão de uma tarefa
  confirmarExclusao() {
    if (this.taskIdToDelete !== null) {
      document.getElementById(`task-${this.taskIdToDelete}`).remove();
      this.atualizarMensagem();
    }

    this.listaTarefas = this.listaTarefas.filter(tarefa => tarefa.id !== this.taskIdToDelete);
    this.fecharModal();
  }

  // Método para editar uma tarefa
  editar(id) {
    this.mostrarModalEdicao(id);
  }

  // Confirma as edições feitas na tarefa	
  confirmarEdicao() {
    // Verifica se tem uma tarefa para editar
    if (this.taskIdToEdit !== null) {
      const tarefa = this.listaTarefas.find(tarefa => tarefa.id === this.taskIdToEdit);
      const input = document.getElementById('editTaskInput');
      const novaDescricao = input.value.trim();
      input.value = ''; // Limpa o campo de entrada

      if (tarefa && novaDescricao) {
        tarefa.editar(novaDescricao);
        // Atualiza a linha na tabela
        const tr = document.getElementById(`task-${tarefa.id}`);
        if (tr) tr.children[1].textContent = novaDescricao;
      }
    }
    this.fecharModal();
  }
}

document.addEventListener('DOMContentLoaded', () => new SchedulerADS())
