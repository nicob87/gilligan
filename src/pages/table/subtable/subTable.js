/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import React, { Component } from "react";
import "./subTable.css";
import { StackItem, TextContent } from "@patternfly/react-core";
import { Split, SplitItem } from "@patternfly/react-core";
import { Flex, FlexItem } from "@patternfly/react-core";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHeading,
} from "@patternfly/react-core";
import LastUpdated from "../../../lastUpdated";
import SubDetails from "./subDetails";
import PopupCard from "../../../popupCard";
import PieBar from "../../topology/charts/pieBar";
import TimeSeries from "../../topology/charts/timeSeries";
import ChordViewer from "../../topology/chord/chordViewer";
import SiteModal from "../../topology/cards/siteModal";
import QDRPopup from "../../../qdrPopup";
import { viewsMap as VIEWS } from "../../topology/views/views";
import { utils } from "../../../utilities";

class SubTable extends Component {
  constructor(props) {
    super(props);
    this.state = { popupContent: null };
    this.viewObj = new VIEWS[this.props.view](this.props.service);
    this.view = this.props.view;
  }

  componentDidMount = () => {
    const options = { item: this.props.info.value };
    this.viewObj.saveDetailOptions(options);
    if (this.chordRef && this.chordRef.init) {
      this.chordRef.init();
    }
  };

  handleChangeLastUpdated = () => {
    this.updatedRef.update();
  };

  update = () => {
    this.handleChangeLastUpdated();
    if (this.pieRef1) this.pieRef1.doUpdate();
    if (this.pieRef2) this.pieRef2.doUpdate();
    if (this.lineRef1) this.lineRef1.doUpdate();
    if (this.lineRef2) this.lineRef2.doUpdate();
    if (this.chordRef) this.chordRef.doUpdate();
    if (this.modalRef) this.modalRef.doUpdate(this.props);
  };

  returnToTable = () => {
    this.props.handleChangeViewMode("table");
  };
  returnToGraph = () => {
    this.props.handleChangeViewMode("graph");
  };

  showTooltip = (content, eventX, eventY) => {
    this.setState({ popupContent: content }, () => {
      if (content) {
        // after the content has rendered, position it
        utils.positionPopup({
          containerSelector: "#skSubtableCharts",
          popupSelector: "#popover-div",
          constrainY: false,
          eventX,
          eventY,
        });
      }
    });
  };
  handleExpandChord = () => {};

  data = () =>
    this.props.data
      ? this.props.data
      : this.props.info.extraInfo.rowData.data.cardData;

  anyRequests = (direction) => {
    const data = this.data();
    let address = data ? data.address : null;
    let site_info = null;
    if (this.props.view === "deployment" && data.address) {
      site_info = data.cluster.site_name;
    } else if (this.props.view === "site" && !data.address) {
      address = data.site_id;
    }
    const requests = this.viewObj.specificTimeSeries({
      VAN: this.props.service.VAN,
      direction,
      stat: "bytes_out",
      duration: "min",
      address,
      site_name: site_info,
    });
    return Object.keys(requests).length > 0;
  };

  render() {
    const { options } = utils.viewFromHash();
    const data = this.data();
    const hasIn = this.anyRequests("in");
    const hasOut = this.anyRequests("out");

    const deploymentLinks = () =>
      this.props.service.adapter
        .getDeploymentLinks()
        .filter(
          (l) =>
            l.source.service.address === this.props.data.address ||
            l.target.service.address === this.props.data.address
        );

    const breadcrumb = () => {
      if (this.props.data) {
        return (
          <Breadcrumb className="sk-breadcrumbList">
            <BreadcrumbItem onClick={this.returnToGraph}>
              {utils.Icap(this.props.view)}s
            </BreadcrumbItem>
            <BreadcrumbHeading>
              {utils.shortName(data.address)}
            </BreadcrumbHeading>
          </Breadcrumb>
        );
      }
      return (
        <Breadcrumb className="sk-breadcrumbList">
          <BreadcrumbItem onClick={this.returnToTable}>
            {utils.Icap(this.props.view)}s
          </BreadcrumbItem>
          <BreadcrumbHeading>{options.item}</BreadcrumbHeading>
        </Breadcrumb>
      );
    };
    return (
      <React.Fragment>
        <StackItem className="sk-breadcrumbs">
          <Split gutter="md">
            <SplitItem>{breadcrumb()}</SplitItem>
            <SplitItem isFilled></SplitItem>
            <SplitItem>
              <TextContent>
                <LastUpdated ref={(el) => (this.updatedRef = el)} />
              </TextContent>
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem className="sk-subtable-content" id="skSubtableCharts">
          <div
            id="popover-div"
            className={
              this.state.popupContent
                ? "sk-popover-div"
                : "sk-popover-div hidden"
            }
            ref={(el) => (this.popupRef = el)}
          >
            <QDRPopup content={this.state.popupContent}></QDRPopup>
          </div>

          {data && (
            <Flex direction={{ default: "column", lg: "row" }}>
              {this.props.info.card && (
                <FlexItem>
                  <PopupCard
                    cardSize="expanded"
                    cardService={data}
                    card={this.props.info.card}
                    service={this.props.service}
                    inline
                    hideBody
                  />
                </FlexItem>
              )}
              <Flex direction={{ default: "column", lg: "row" }}>
                {hasIn && (
                  <FlexItem id="sk-subTable-line1">
                    <TimeSeries
                      ref={(el) => (this.lineRef1 = el)}
                      service={this.props.service}
                      site={
                        this.props.view === "site" ||
                        this.props.view === "deployment"
                      }
                      deployment={this.props.view === "deployment"}
                      stat="bytes_out"
                      direction="in"
                      type="line"
                      viewObj={this.viewObj}
                      containerId="sk-subTable-line1"
                      data={data}
                      showTooltip={this.showTooltip}
                      comment="LIne chart for incoming metric"
                    />
                  </FlexItem>
                )}
                {hasOut && (
                  <FlexItem id="sk-subTable-line2">
                    <TimeSeries
                      ref={(el) => (this.lineRef2 = el)}
                      service={this.props.service}
                      site={
                        this.props.view === "site" ||
                        this.props.view === "deployment"
                      }
                      deployment={this.props.view === "deployment"}
                      stat="bytes_out"
                      direction="out"
                      type="line"
                      viewObj={this.viewObj}
                      containerId="sk-subTable-line2"
                      data={data}
                      showTooltip={this.showTooltip}
                      comment="LIne chart for outgoing metric"
                    />
                  </FlexItem>
                )}
                {hasIn && (
                  <FlexItem id="sk-subTable-bar1">
                    <PieBar
                      ref={(el) => (this.pieRef1 = el)}
                      service={this.props.service}
                      site={
                        this.props.view === "site" ||
                        this.props.view === "deployment"
                      }
                      deployment={this.props.view === "deployment"}
                      stat="bytes_out"
                      direction="out"
                      type="bar"
                      viewObj={this.viewObj}
                      containerId="sk-subTable-bar1"
                      data={data}
                      showTooltip={this.showTooltip}
                      comment="Pie or bar chart for incoming metric"
                    />
                  </FlexItem>
                )}
                {hasOut && (
                  <FlexItem id="sk-subTable-bar2">
                    <PieBar
                      ref={(el) => (this.pieRef2 = el)}
                      service={this.props.service}
                      site={
                        this.props.view === "site" ||
                        this.props.view === "deployment"
                      }
                      deployment={this.props.view === "deployment"}
                      stat="bytes_out"
                      direction="in"
                      type="bar"
                      viewObj={this.viewObj}
                      containerId="sk-subTable-bar2"
                      data={data}
                      showTooltip={this.showTooltip}
                      comment="Pie or bar chart for incoming metric"
                    />
                  </FlexItem>
                )}
                {(hasIn || hasOut) && (
                  <div
                    id="skModalskAllCharts"
                    className="sk-subtable-chord-container"
                  >
                    <div className="sk-chart-header">{`Site to site traffic for ${utils.shortName(
                      data.address
                    )}`}</div>
                    <FlexItem id="sk-subTable-chord">
                      <ChordViewer
                        ref={(el) => (this.chordRef = el)}
                        {...this.props}
                        site
                        deployment
                        prefix="skModal"
                        containerId="skModalskAllCharts"
                        noLegend
                        handleArcOver={() => {}}
                        handleChordOver={() => {}}
                        showTooltip={this.showTooltip}
                        deploymentLinks={deploymentLinks()}
                        site2site
                        stat="bytes_out"
                        initial
                      />
                    </FlexItem>
                    <SiteModal
                      ref={(el) => (this.modalRef = el)}
                      {...this.props}
                      data={data}
                    />
                  </div>
                )}
              </Flex>
            </Flex>
          )}
          <SubDetails {...this.props} />
        </StackItem>
      </React.Fragment>
    );
  }
}

export default SubTable;
