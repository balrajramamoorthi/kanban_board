import React from "react";
import { DragDropContext, DropTarget, DragSource } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';
import APIURL from "./APIUrl";
import axios from "axios";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";

const quarters = ["q1", "q2", "q3", "q4"];
const labelsMap = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4"
};
const qtrs = ["Q1", "Q2", "Q3", "Q4"];

const classes = {
  board: {
    display: "flex",
    margin: "0 auto",
    width: "0 auto",
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
    backgroundColor: "#FCC8B2"
  },
  column: {
    minWidth: 350,
    width: "auto",
    height: "70vh auto",
    margin: "0 auto",
    // backgroundColor: "#FCC8B2"
  },
  columnHead: {
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    backgroundColor: "#C6D8AF"
  },
  item: {
    padding: 10,
    margin: 10,
    fontSize: "0.8em",
    cursor: "pointer",
    backgroundColor: "white"
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [], error: "", show: false,
      modal: false,
      selectedId: 0, taskDescription: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.edit = this.edit.bind(this);
  }
  deletedocument = (id) => {
    confirmAlert({
      message: 'Are you sure you wish to delete this task?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.getDeleteUrl(id)
        },
        {
          label: 'No',
          // onClick: () => alert('Click No')
        }
      ]
    });
  }
  getDeleteUrl = (id) => {
    const formData = new FormData();
    formData.append('selectedId', id)
    axios.post(APIURL + '/deleteTasks', formData)
      .then(response => {
        if (response.status === 200) {
          confirmAlert({
            message: 'Task Details Successfully Deleted',
            buttons: [{ label: 'Close', }]
          });
          this.componentDidMount();
        }
      },
        (error) => {
          confirmAlert({
            message: 'Task Details Failed to Delete!',
            buttons: [{ label: 'Close', }]
          });
        });
  }
  handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({
      [name]: value
    })
  }
  handleModal(id, name, label) {
    if (id >= 0) {
      this.setState({ show: !this.state.show, modelLabel: label, selectedId: id, taskDescription: "" })
      this.getDetails(id);
    }
  }
  getDetails(id) {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(),
    }
    fetch(APIURL + '/getTaskDetails/' + id, options)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            taskDescription: result[0].title,
          });
        },
        (error) => {
          this.setState({ error });
        }
      )
  }
  edit(id) {
    this.setState({ show: !this.state.show, modelLabel: name })
    this.getDetails(id);
  }

  save(status) {
    const formData = new FormData();
    formData.append('status', status)
    formData.append('title', this.state.taskDescription)
    axios.post(APIURL + '/addTask', formData)
      .then(response => {
        if (response.status === 200) {
          confirmAlert({
            message: 'Task Details Successfully Created',
            buttons: [{ label: 'Close', }]
          });
          this.setState({ show: !this.state.show, modelLabel: name })
          this.componentDidMount();
        }
      },
        (error) => {
          confirmAlert({
            message: 'Task Details Failed to Create!',
            buttons: [{ label: 'Close', }]
          });
        });
  }
  updateTask(id, name) {
    const formData = new FormData();
    formData.append('status', name)
    formData.append('id', id)
    formData.append('title', this.state.taskDescription)
    axios.post(APIURL + '/updateTask', formData)
      .then(response => {
        if (response.status === 200) {
          confirmAlert({
            message: 'Task Details Successfully Updated',
            buttons: [{ label: 'Close', }]
          });
          this.setState({ show: !this.state.show })
          this.componentDidMount();
        }
      },
        (error) => {
          confirmAlert({
            message: 'Task Details Failed to Update!',
            buttons: [{ label: 'Close', }]
          });
        });
  }
  componentDidMount() {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    }
    fetch(APIURL + '/getList', options)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            tasks: result
          });
        },
        (error) => {
          this.setState({ error });
        }
      )
  }
  update = (id, status) => {
    const formData = new FormData();
    formData.append('status', status)
    formData.append('id', id)
    axios.post(APIURL + '/moveTask', formData)
      .then(response => {
        if (response.status === 200) {
          this.componentDidMount();
        }
      },
        (error) => {
          confirmAlert({
            message: 'Failed to move',
            buttons: [{ label: 'Close', }]
          });
        });
  };

  render() {
    const { tasks, error } = this.state;
    if (error) {
      return (
        <div>Data Not Available</div>
      )
    } else {
      return (
        <main>
          <header><h4>Company’s Strategies</h4> </header>
          <div className="split left">
            {qtrs.map(qtr => (
              <div className="card">
                <div className="w3-panel w3-card"><p>{qtr}</p></div>
              </div>
            ))}
          </div>

          <div className="splitright right">

            <section style={classes.board}>
              {quarters.map(quarter => (
                <KanbanColumn status={quarter}>
                  <div style={classes.column}>
                    <div style={classes.columnHead}>{labelsMap[quarter]}</div>
                    <div>
                      {tasks
                        .filter(item => item.status === quarter)
                        .map(item => (
                          <KanbanItem id={item._id} onDrop={this.update}>
                            <div style={classes.item}>{item.title}
                              <div style={{ float: "right" }}><FontAwesomeIcon icon={faEdit} onClick={() => this.handleModal(item._id, item.title, quarter)} />   <FontAwesomeIcon icon={faTrash} onClick={e => this.deletedocument(item._id)} /></div>
                            </div>
                          </KanbanItem>
                        ))}
                      <KanbanItem >
                        <div style={{ textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }} onClick={() => this.handleModal(0, "", quarter)}> Add New <FontAwesomeIcon icon={faAdd} /></div>
                      </KanbanItem>
                    </div>

                  </div>
                </KanbanColumn>
              ))}

              <Modal size="xl" show={this.state.show} onHide={() => this.handleModal(0, "", "")}>
                <ModalHeader closeButton>Task Details {this.state.modelLabel}</ModalHeader>
                <ModalBody >
                  <textarea name="taskDescription" value={this.state.taskDescription} rows={5} onChange={this.handleChange}></textarea>
                </ModalBody>
                <ModalFooter>
                  {(() => {
                    switch (Number(this.state.selectedId)) {
                      case 0: return <Button variant="primary" size="sm" onClick={() => this.save(this.state.modelLabel)} color="danger">Save</Button>;
                      default: return <Button variant="primary" size="sm" onClick={() => this.updateTask(this.state.selectedId, this.state.modelLabel)} color="danger">Update</Button>;
                    }
                  })()}
                  <Button size="sm" onClick={() => this.handleModal(0, "", "")} color="danger">Close</Button>
                </ModalFooter>
              </Modal>
            </section>
          </div>


        </main >
      );
    }
  }
}
export default DragDropContext(HTML5Backend)(App);

// Column

const boxTarget = {
  drop(props) {
    return { name: props.status };
  }
};

class KanbanColumn extends React.Component {
  render() {
    return this.props.connectDropTarget(<div>{this.props.children}</div>);
  }
}

KanbanColumn = DropTarget("kanbanItem", boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(KanbanColumn);

// Item

const boxSource = {
  beginDrag(props) {
    return {
      name: props.id
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult) {
      props.onDrop(monitor.getItem().name, dropResult.name);
    }
  }
};

class KanbanItem extends React.Component {
  render() {
    return this.props.connectDragSource(<div>{this.props.children}</div>);
  }
}

KanbanItem = DragSource("kanbanItem", boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(KanbanItem);
