include "junction.gs"
include "signal.gs"
include "xtrainz03s.gs"
include "zx_specs.gs"


class JuctionWithProperties isclass GSObject
{

public MapObject back=null;		//������ �����
public int back_dir;			//0 - ����������� "��������", 1- ����������� "������", -1 - ��� ������� (����������� ���������� �� ���������)

public MapObject frontLeft=null;	//������ �������, �� ������� �����
public int frontLeft_dir;

public MapObject frontRight=null;	//������ �������, �� ������� �����
public int frontRight_dir;

public int directionF;			//���������� : 0 - ������, 2 - �������
public int OldDirection;

public int Permit_done;			//������� �� ������� ��������, ���� ����� > 0  (������� ����������� ���������: 1 ). ������� �������� ���� = 0. 

public int Message_perm;		//��������� �������������� ���������� ��� Permit_done

public bool Poshorstnost;		//����������/��������������� ����������� ������� � ��������
public int JunctPos;			//������� ������� � ���������� �������� 0 - ������, 1 - �������������, 2 -���������, 3 - ������������ ������ � ���������.

public int PrevJunction;		//ID ���������� ������� � ��������

public bool LastTrainVelDir;		// ����������� �������� ������ �� ����� �������� ������ (�� ��������� � ����������� ��������)

public bool TrainFound;			// ����� ��� �������� (�� �������)

};


class LightJunctionObject isclass GSObject
{
public bool WasInLeft=false;

public bool ExistedInThisSearch=false;
public bool Poshorstna=false;
};



class PathClass isclass GSObject
{
public int mode=-1; //�����. 


// 0 - ���������� �������� ������� �������, � ��� ����� ���������� �������
// 1 - ���������� �������� ������� �������, ����� ���������� �������, �������� �� ���� ������� ����� ������� ��� ���������
// 2 - ������� ������������ (���� ��� ������������� �� ���������, ���������������������)
// 3 - ����������� ����������� ����������� ��������� ��������
// 4 - ���������� ������� (������ ������� �� ��������������)

 
public int self_state; //��������� 

// 0 - �������� ��������� ����������� ��������
// 1 - ����������� �������� ������, ������� ������ ������ ���������
// 2 - ��������� ��������� ����������� �������� �� ��������� ����
// 3 - ������� ����� � ������
// 4 - ������� �������

public string StationName;
public string description;

public int SignalId;
public int pathN;	// ���������� ����� ��������

public int linkedpath=-1; 	// �������, ������ �������� ��������� � ������ self_state 1 
}; 

 




class PathInitObj
{


	public bool Path_init = false;


	public int stationID;
	public int SignalId;
	

	public BinarySortedArrayS JunctionsOfStation;


	public string ST_Name1;

	public Soup sv_sp;


	public Signal sign1;
	public MapObject Previous;


	public bool OtherStation;
	


	public Soup PathSoup1;
	public int NumberOfPaths;
	public int old_NumberOfPaths;

	public int sleep_cnt;



};



class zxMainJunctionControllerBase isclass Buildable
{

public BinarySortedArrayS BSJunctionLib;

public Soup StationProperties;

public BinarySortedArrayS2 PathLib;


public Soup cache2;

public bool IsInited=false;
public bool IsInited2=false;


public int CurrentPath=2;
public int CancelPath=-1;


Soup[] pathSoup;
PathClass PCS1;

bool IsChecking=false;

public int max_path_number=100;

Soup processing_junctions;


string er45;



Browser sub_browser = null;
bool been_refreshing = false;



public Soup ToSoupPaths()
	{
	int i=0;
	int Nmb=PathLib.N;
	Soup sp3=Constructors.NewSoup();

	PathClass P_element;

	while(i<Nmb)
		{
		P_element=cast<PathClass>(PathLib.DBSE[i].Object);

		if(P_element.mode>=0)
			{
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".mode",P_element.mode);
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".self_state",P_element.self_state);

			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".StationName",P_element.StationName);
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".description",P_element.description);
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".SignalId",P_element.SignalId);
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".pathN",P_element.pathN);
			sp3.SetNamedTag((string)(PathLib.DBSE[i].a)+".linkedpath",P_element.linkedpath);

			sp3.SetNamedTag((string)("soup_name_"+i),(string)(PathLib.DBSE[i].a));

			i++;
			}
		else
			Nmb--;
		}


	sp3.SetNamedTag("my_volume1",Nmb);

	return sp3;
	}


public void FromSoupPaths(Soup sp7)
	{
	int i;

	int size11=sp7.GetNamedTagAsInt("my_volume1",-1);			

	PathLib.N=0;
	PathLib.DBSE[0,]=null;
	if(size11<=0)
		return;


	
	PathLib.N=size11;
	PathLib.DBSE = new BinarySortedElementS[size11];


	for(i=0;i<size11;i++)
		{
		PathClass P_element=new PathClass();
		string P_name=sp7.GetNamedTag((string)("soup_name_"+i));

		P_element.mode = sp7.GetNamedTagAsInt(P_name+".mode",0);
		P_element.self_state = sp7.GetNamedTagAsInt(P_name+".self_state",0);


		P_element.StationName = sp7.GetNamedTag(P_name+".StationName");
		P_element.description = sp7.GetNamedTag(P_name+".description");
		P_element.SignalId = sp7.GetNamedTagAsInt(P_name+".SignalId",0);
		P_element.pathN = sp7.GetNamedTagAsInt(P_name+".pathN",0);
		P_element.linkedpath = sp7.GetNamedTagAsInt(P_name+".linkedpath",-1);

		PathLib.DBSE[i] = new BinarySortedElementS();
		PathLib.DBSE[i].a =P_name;
		PathLib.DBSE[i].Object=cast<GSObject>P_element;
		}
	}







public int FindJunctionPropertiesId(Junction Current)
	{
	return BSJunctionLib.Find(Current.GetName(),false);
	}


public MapObject MakeSearchByJunctions(int JunctionPropId, MapObject previous, int J_direction )
	{
	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft==previous or (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight==previous)
		{
		return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back;
		}

	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back == previous)
		{
		if(J_direction == Junction.DIRECTION_LEFT)
			{
			return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft;
			}
		else
			{
			return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight;
			}
		}

	return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back;
	}




public int GetDirectionByJunctions(int JunctionPropId, MapObject previous, int J_direction )
	{
	
	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft==previous or (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight==previous)
		return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back_dir;

	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back == previous)
		{
		if(J_direction == Junction.DIRECTION_LEFT)
			return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft_dir;
		else
			return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight_dir;
		}

	return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).back_dir;
	}


public bool ThisJPoShorstn(int JunctionPropId, MapObject previous)
	{
	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft==previous or (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight==previous)
		return true;
	return false;
	}



public int TrueJdir(int JunctionPropId, MapObject previous)
	{
	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontLeft==previous)
		return 0;

	if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).frontRight==previous)
		return 2;

	return -1;
	}


public void SetJunctionPermit(int JunctionPropId, int NewPermit)
	{
	(cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).Permit_done=NewPermit;
	}


public int GetJunctionPermit(int JunctionPropId)
	{
	return (cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object)).Permit_done;
	}



bool CheckForTheLastestJunctionFromTheEnd(Soup PathSoup, BinarySortedArrayS JunctionsOfStation)
	{
	if(!PathSoup)
		return true;

	int i=PathSoup.GetNamedTagAsInt("NumberOfObjects",-1) -1;
	if(i<0)
		return false;


	while(i>=0)
		{
		int JunctLghtId = JunctionsOfStation.Find(TrainUtil.GetUpTo(PathSoup.GetNamedTag("object_"+i),","));
		if(JunctLghtId<0)
			{
			string str11="can't find "+TrainUtil.GetUpTo(PathSoup.GetNamedTag("object_"+i),",");
			Interface.Log(str11);
			}
		else
			{

			if(!(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft and !(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna)
				{
				(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=true;
				i++;
				while(i<PathSoup.GetNamedTagAsInt("NumberOfObjects"))
					{
					JunctLghtId = JunctionsOfStation.Find(TrainUtil.GetUpTo(PathSoup.GetNamedTag("object_"+i),","));

					(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=false;
					i++;
					}

				return true;
				}
			}

		i--;
		}

	return false;
	}



PathInitObj path_initing = new PathInitObj();





void ProcessPathMaking()
	{
/*
PostMessage(me, "SelfTimedMessage", "PathMaking", 0.0);

*/



	string s7564;

	while(CheckForTheLastestJunctionFromTheEnd(path_initing.PathSoup1, path_initing.JunctionsOfStation) and path_initing.NumberOfPaths<max_path_number)
		{
		if(path_initing.PathSoup1)
			{
			if(path_initing.PathSoup1.GetNamedTag("object_ending")!="")
				path_initing.PathSoup1.Clear();
			}
		else
			path_initing.PathSoup1=Constructors.NewSoup();



		path_initing.Previous = path_initing.sign1;
		GSTrackSearch GSTS1 = path_initing.sign1.BeginTrackSearch(true);
		MapObject MO = GSTS1.SearchNext();
		bool TempStrDir = true;
		if(MO and MO.isclass(Trackside) and !MO.isclass(Junction))
			TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();

		int NumberOfObjects=0;

		while(MO and !path_initing.OtherStation)
			{
			string O_name=MO.GetName();
			if(O_name!="" and   (   (O_name.size()>3 and O_name[0,4]=="stop")  or (TempStrDir and O_name.size()>6 and O_name[0,7]=="dirstop") )   )
				path_initing.OtherStation=true;
			else
				{
				if(MO.isclass(Vehicle) or !MO.isclass(Trackside) or MO.GetName()=="")
					{
					MO=GSTS1.SearchNext();
					TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
					}
				else
					{
					path_initing.OtherStation=false;
					Junction TempJunction=cast<Junction>MO;

					if(TempJunction)
						{
						int JunctionID1 = FindJunctionPropertiesId(TempJunction);

						if(JunctionID1 < 0)
							Interface.Exception("Junction '"+MO.GetName()+"' was not found in database");

						string Junct_name2= BSJunctionLib.DBSE[JunctionID1].a;

						//s7564="name "+Junct_name2+" id= "+JunctionID1;
						//Interface.Log(s7564);
	
						int JunctLghtId = path_initing.JunctionsOfStation.Find(Junct_name2);

						if(JunctLghtId<0)
							{
							LightJunctionObject LJO=new LightJunctionObject();
							JunctLghtId = path_initing.JunctionsOfStation.AddElement(Junct_name2,cast<GSObject>LJO);
							}

						int dir2;				

						if(ThisJPoShorstn(JunctionID1,path_initing.Previous)) //���� ������� ���������� (��������� ������ ����������� �����������)
							{
							dir2 = TrueJdir(JunctionID1,path_initing.Previous);

							//s7564="direction "+dir2+" Lid "+JunctLghtId;
							//Interface.Log(s7564);


							(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna=true;
	
							if((cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch) // ������ �� ����������� ��������� ("�� ��� ������� ��� ���������")
								path_initing.OtherStation=true;
							else
								{
								(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch=true;
					
								if(!dir2)
									(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=true;
								}
							}
						else		// ������� ���������������
							{
							(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna=false;


							if((cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch) // ������ �� ����������� ��������� ("�� ��� ������� ��� ���������")
								path_initing.OtherStation=true;
							else
								{
								(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch=true;
					
								if((cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft ) // ������� � ������ ���������� ������ ("�����" ��� �����������)
									{
									if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionID1]).Object)).OldDirection == 2)
										dir2=0; 
									else
										dir2=2;
									}
								else					// ��� �� �����������
									{
									if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionID1]).Object)).OldDirection == 2)
										dir2=2;
									else
										dir2=0;
									}
								}
							}


						if(!path_initing.OtherStation)
							{
							int posh_ind=0;
							if(ThisJPoShorstn(JunctionID1,path_initing.Previous))
								posh_ind=1;

							path_initing.PathSoup1.SetNamedTag("object_"+NumberOfObjects,Junct_name2+","+dir2+","+posh_ind);						
	
							NumberOfObjects++;
	
							//s7564="prev_ "+Previous.GetName();
							//Interface.Log(s7564);


							MO=MakeSearchByJunctions(JunctionID1,path_initing.Previous,dir2);

							if(MO)
								{
								//s7564="dir "+dir2+" Obj die "+JunctLghtId+" direction Next = "+GetDirectionByJunctions(JunctionID1,Previous,dir2)+" x_name "+MO.GetName();
								//Interface.Log(s7564);

								if(GetDirectionByJunctions(JunctionID1,path_initing.Previous,dir2)>=0 )	//���� ��������� - �������, �� � ����������� ��������� ����������
									{					
									if(GetDirectionByJunctions(JunctionID1,path_initing.Previous,dir2)==1 )
										{
										GSTS1 = (cast<Trackside>MO).BeginTrackSearch(true);
										TempStrDir = true;
										}
									else
										{
										GSTS1 = (cast<Trackside>MO).BeginTrackSearch(false);
										TempStrDir = false;
										}
									}
								path_initing.Previous=TempJunction;
								}
							else
								path_initing.OtherStation=true;
							}
						}
					else
						{
						zxSignal TempSignal=cast<zxSignal>MO;
						if(TempSignal)
							{
							string signalStation1=TempSignal.stationName;
	
							if(signalStation1!="")
								{
								bool directionRtoStearch = TempStrDir;
								int signalType = TempSignal.Type;

								if(signalType>0 and directionRtoStearch and (signalStation1 != path_initing.ST_Name1 or signalType&2 ) and signalType&(2+4+8))	//��� ������� (���������) �������
									{
									path_initing.OtherStation=true;
									path_initing.PathSoup1.SetNamedTag("object_ending",TempSignal.privateName+"@"+signalStation1);
									path_initing.PathSoup1.SetNamedTag("object_priority",TempSignal.def_path_priority);
									path_initing.PathSoup1.SetNamedTag("object_Name",TempSignal.GetName());

									path_initing.PathSoup1.SetNamedTag("object_length",-1.0);
									}
								else
									{
									if(directionRtoStearch and signalType & (2+4+8))
										{
										path_initing.OtherStation=true;
										path_initing.PathSoup1.SetNamedTag("object_ending",TempSignal.privateName);
										path_initing.PathSoup1.SetNamedTag("object_priority",TempSignal.def_path_priority);
										path_initing.PathSoup1.SetNamedTag("object_Name",TempSignal.GetName());

										GSTS1 = TempSignal.BeginTrackSearch(false);
										MO=GSTS1.SearchNext();
										TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();

										while(MO and !MO.isclass(Junction) and !(MO.isclass(zxSignal) and (  (cast<zxSignal>MO).Type & (2+4+8)  ) )    )
											{
											MO=GSTS1.SearchNext();
											TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
											}
										path_initing.PathSoup1.SetNamedTag("object_length",GSTS1.GetDistance());
										}
									else
										{
										path_initing.Previous=MO;
										MO=GSTS1.SearchNext();
										TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
										}
									}
								}
							else
								{
								path_initing.Previous=MO;
								MO=GSTS1.SearchNext();
								TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
								}
							}
						else
							{
							if(!MO.isclass(Vehicle) and MO.isclass(Trackside) and MO.GetName()!="")
								path_initing.Previous=MO;					
							MO=GSTS1.SearchNext();
							TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
							}

						if(GSTS1.GetDistance()>4000 and MO and MO.isclass(Trackside) and !MO.isclass(Vehicle) and !MO.isclass(Junction))
							{
							GSTS1=(cast<Trackside>MO).BeginTrackSearch(TempStrDir);
							}
						}
					}
				}
			}
		path_initing.PathSoup1.SetNamedTag("NumberOfObjects",NumberOfObjects);

		path_initing.OtherStation=false;



		int k=0;
		bool notExist=true;



		if(path_initing.PathSoup1.GetNamedTag("object_ending")!="")
			{

			path_initing.sv_sp.SetNamedSoup("sv_^"+path_initing.SignalId+"^"+path_initing.NumberOfPaths, path_initing.PathSoup1);


			path_initing.old_NumberOfPaths = path_initing.NumberOfPaths;
			path_initing.NumberOfPaths++;


			if(path_initing.NumberOfPaths > max_path_number)
				Interface.Exception( GetAsset().GetStringTable().GetString("toomuchpaths") );

			}



		int j;
		for(j=0;j<path_initing.JunctionsOfStation.N;j++)									// �������� ������ � ������� ������� � ��������
			(cast<LightJunctionObject>(path_initing.JunctionsOfStation.DBSE[j].Object)).ExistedInThisSearch=false;



		path_initing.sleep_cnt++;

		if(path_initing.sleep_cnt > 5)
			{
			path_initing.sleep_cnt = 0;
			
			PostMessage(me, "SelfTimedMessage", "PathMaking", 0.0);

			return;
			}
			
		}

	int j;
	for(j=0;j<path_initing.JunctionsOfStation.N;j++)									// �������� ������ � ������� ������� � ��������
		{
		path_initing.JunctionsOfStation.DBSE[j].Object = null;
		path_initing.JunctionsOfStation.DBSE[j] = null;
		}


	path_initing.JunctionsOfStation.N = 0;
	path_initing.JunctionsOfStation.DBSE[0, ] = null;
	path_initing.JunctionsOfStation = null;

	path_initing.sv_sp.SetNamedTag("sv_paths_number^"+path_initing.SignalId,path_initing.NumberOfPaths);


//	PostMessage(me,"Refresh","now",0.0);
	if(sub_browser and !been_refreshing)
		PropertyBrowserRefresh(sub_browser);


	path_initing.Path_init = false;



	}





public void MakeAllPathsFromSignal(int next_stationID, int next_SignalId)
	{

	if(path_initing.Path_init)
		{
		if(path_initing.NumberOfPaths != path_initing.old_NumberOfPaths)
			{
			path_initing.old_NumberOfPaths = path_initing.NumberOfPaths;
			return;
			}
		}



	path_initing.Path_init = true;


	path_initing.stationID = next_stationID;
	path_initing.SignalId = next_SignalId;



	path_initing.JunctionsOfStation = new BinarySortedArrayS();


	path_initing.ST_Name1= StationProperties.GetNamedTag("station_name_by_ID"+ path_initing.stationID);
	path_initing.sv_sp = StationProperties.GetNamedSoup(path_initing.ST_Name1 +".svetof_soup");



	string temp121 = path_initing.sv_sp.GetNamedTag("sv_n^"+path_initing.SignalId);

	path_initing.sign1 = cast<zxSignal>(Router.GetGameObject(temp121));
	if(!path_initing.sign1)
		Interface.Exception("Map object "+temp121+" is not a sU-signal!" );
	

	path_initing.OtherStation=false;
	
	


	path_initing.PathSoup1 = null;
	path_initing.NumberOfPaths = 0;
	

	path_initing.sleep_cnt = 0;




	int PathOldNumb = path_initing.sv_sp.GetNamedTagAsInt("sv_paths_number^"+path_initing.SignalId,0);
	int j1;
	for(j1=0;j1<PathOldNumb;j1++) 
		path_initing.sv_sp.GetNamedSoup("sv_^"+path_initing.SignalId+"^"+j1).Clear();


	PostMessage(me, "SelfTimedMessage", "PathMaking", 0.0);

	}



public bool SpanDirectedCorrectly(string ST_name, int SignalId, int pathN);
bool CheckJunctionsAreFree(string ST_name, int SignalId, int pathN);
void LockThisPath(string ST_name, int SignalId, int pathN, string pathID);
public bool ChangeSpanDirectionFor(string ST_name, int SignalId, int pathN);
bool CheckPathForRemove(int path_nmb);
public void SetUsualPath(string ST_name, int SignalId, int pathN, bool Locked);


public bool CheckPath(int i)
	{
	PathClass P_element=cast<PathClass>(PathLib.DBSE[i].Object);

	if(P_element.mode<0)
		return true;

/*

int mode=-1; //�����. 


// 0 - ���������� �������� ������� �������, � ��� ����� ���������� �������
// 1 - ���������� �������� ������� �������, ����� ���������� �������, �������� �� ���� ������� ����� ������� ��� ���������
// 2 - ������� ������������ (���� ��� ������������� �� ���������, ���������������������)
// 3 - ����������� ����������� ����������� ��������� ��������
// 4 - ���������� ������� (������ ������� �� ��������������)

 
int self_state; //��������� 

// 0 - �������� ��������� ����������� ��������
// 1 - ����������� �������� ������, ������� ������ ������ ���������
// 2 - ��������� ��������� ����������� �������� �� ��������� ����
// 3 - ������� ����� � ������
// 4 - ������� �������


*/


//er45="in "+PathLib.DBSE[i].a+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).mode+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).self_state+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).description;
//Interface.Log(er45);


	if((cast<PathClass>(PathLib.DBSE[i].Object)).mode!=4)
		{

		if((cast<PathClass>(PathLib.DBSE[i].Object)).self_state!=4)
			{
			bool span_dir=SpanDirectedCorrectly(P_element.StationName, P_element.SignalId, P_element.pathN);
			bool junct_state=CheckJunctionsAreFree(P_element.StationName, P_element.SignalId, P_element.pathN);
			if(span_dir and junct_state)
				(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=3;
			if(!span_dir and !junct_state)
				(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=2;
			if(span_dir and !junct_state)
				(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=1;
			if(!span_dir and junct_state)
				(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=0;

						
			if((cast<PathClass>(PathLib.DBSE[i].Object)).mode==1 and (cast<PathClass>(PathLib.DBSE[i].Object)).linkedpath >= 2)
				{
				int L_number=PathLib.Find((cast<PathClass>(PathLib.DBSE[i].Object)).linkedpath);
				if(L_number >=0)
					{
					if( (cast<PathClass>(PathLib.DBSE[L_number].Object)).self_state != 4)
						{
						(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=1;
						return true;
						}
					}
				}


			if( (cast<PathClass>(PathLib.DBSE[i].Object)).mode<=2 )
				{
				if((cast<PathClass>(PathLib.DBSE[i].Object)).self_state==3)
					{
					LockThisPath(P_element.StationName, P_element.SignalId, P_element.pathN, PathLib.DBSE[i].a);
					(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=4;
					}
				if((cast<PathClass>(PathLib.DBSE[i].Object)).self_state==0)
					{
					if(   ChangeSpanDirectionFor(P_element.StationName, P_element.SignalId, P_element.pathN)  )
						CheckPath(i);
					}
				}

			else if((cast<PathClass>(PathLib.DBSE[i].Object)).mode==3)
				{
				bool res = ((cast<PathClass>(PathLib.DBSE[i].Object)).self_state==3);
				PathLib.DeleteElementByNmb(i);
				CurrentPath--;

				return res;
				}
			}
		else
			{
			if(CheckPathForRemove(i))
				return false;
			}
		}

//er45="res "+PathLib.DBSE[i].a+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).mode+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).self_state+" "+(cast<PathClass>(PathLib.DBSE[i].Object)).description;
//Interface.Log(er45);

	return true;
	}



void LockThisPath(string ST_name, int SignalId, int pathN, string pathID)
	{
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	string[] tmpstr2;
	int Path_nmb=Str.ToInt(pathID);


	int JunctionsNumber2=sp1.GetNamedTagAsInt("NumberOfObjects",0);
	int i=0,temp_id;
	Junction Jn1;

	int OldJunId=-1;


	if( JunctionsNumber2 == 0 )
		{
		Interface.Exception("Can't lock path with no jnctions. Station "+ST_name+", signal  "+sv_sp.GetNamedTag("sv^"+SignalId) + ", path N "+ pathN );
		return;
		}

	string TempAttachedJunction;

	while(i<JunctionsNumber2)
			{
			tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
			temp_id=BSJunctionLib.Find(tmpstr2[0]);

			if(temp_id == OldJunId)
				Interface.Exception("Junctions "+BSJunctionLib.DBSE[OldJunId].a+" and "+tmpstr2[0]+" have the same ID. Reinit junctions.");
			
			JuctionWithProperties junct_prop = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object));

			
			junct_prop.Permit_done=Path_nmb;
			junct_prop.PrevJunction= OldJunId;
			junct_prop.LastTrainVelDir = true;	//��� ����� �������� �� ��������


			OldJunId=temp_id;

			if(i==0)
				{
				if( JunctionsNumber2 != 1 )
					junct_prop.JunctPos=0;
				else
					junct_prop.JunctPos=3;
				}
			else
				{
				if(i==(JunctionsNumber2-1))
					junct_prop.JunctPos=2;
				else
					junct_prop.JunctPos=1;
				}
	
			if(tmpstr2[2]=="1")
				junct_prop.Poshorstnost=true;
			else
				junct_prop.Poshorstnost=false;


			junct_prop.TrainFound = false;	// ���������, ��� ����� �� ������� ��� �� ������ ��� ����� �������� �� ���


			Jn1 = cast<Junction>Router.GetGameObject( BSJunctionLib.DBSE[temp_id].a );
			int dir1 = Str.ToInt(tmpstr2[1]);


			if(!Jn1.SetDirection(dir1))
				{
				Jn1.AllowManualControl(true);
				Jn1.SetDirection(dir1);
				}

			Jn1.SetDefaultDirection(dir1);

			TempAttachedJunction = tmpstr2[0];


			tmpstr2[0]=null;
			tmpstr2[1]=null;
			tmpstr2[2]=null;
			tmpstr2[0,]=null;

			i++;	
			}



	zxSignal Sgn = cast<zxSignal>(Router.GetGameObject( sv_sp.GetNamedTag("sv_n^"+SignalId) ));
	
	GSTrackSearch GSTS1= Sgn.BeginTrackSearch(true);

	MapObject MO=GSTS1.SearchNext();
	
	i=0;

	while(MO and i<JunctionsNumber2)
		{
		if(MO.isclass(Trigger) and MO.GetProperties().GetNamedTagAsBool("zxPath_can_lock",false))
			{
			//Interface.Log("obj_founded !!!!");
			Soup OldProp=MO.GetProperties();
			OldProp.SetNamedTag("zxPath_lock",Path_nmb);
			MO.SetProperties(OldProp);
			}
		if(MO.isclass(Junction))
			i++;
		MO=GSTS1.SearchNext();
		}

	
/*	if(MO and !MO.isclass(Junction) )		// �� �����
		{
		GSTrackSearch GSTS2= GSTS1.CloneSearch();
		bool dir1 = GSTS1.GetFacingRelativeToSearchDirection();


		MapObject MO2 = MO;


		while(MO2 and !MO2.isclass(Junction) and !( MO2.isclass(zxSignal) and !dir1  and ((cast<zxSignal>MO2).Type & (zxSignal.ST_IN+zxSignal.ST_OUT+zxSignal.ST_ROUTER))  ) )
			{
			MO2 = GSTS2.SearchNext();
			dir1 = GSTS2.GetFacingRelativeToSearchDirection();
			}
		}
*/


	if(MO and MO.isclass(Trigger) and MO.GetProperties().GetNamedTagAsBool("zxPath_can_lock",false))
		{
		//Interface.Log("obj_founded !!!!");
		Soup OldProp=MO.GetProperties();
		OldProp.SetNamedTag("zxPath_lock",Path_nmb);
		MO.SetProperties(OldProp);
		}


// ��������� ��������


	Sgn.train_open= true;
	Sgn.UpdateState(0,-1);
	}



bool CheckPathForRemove(int path_nmb)
	{
	PathClass P_element=cast<PathClass>(PathLib.DBSE[path_nmb].Object);

	string ST_name=P_element.StationName;
	int SignalId=P_element.SignalId;
	int pathN=P_element.pathN;
	int path_abs_nmb=Str.ToInt(PathLib.DBSE[path_nmb].a);
	int mode = P_element.mode;


	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	int temp_id;
	

	int JunctionsNumber1=sp1.GetNamedTagAsInt("NumberOfObjects",0);

	if(JunctionsNumber1!=0)
		{	
		int i=0;
		while(i<JunctionsNumber1)	// ����������� ����������� �������
			{
			temp_id=BSJunctionLib.Find(TrainUtil.GetUpTo(sp1.GetNamedTag("object_"+i),","));
		
			if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done)==path_abs_nmb)
				return false;	
				
			i++;		
			}
		}


	PathLib.DeleteElement(PathLib.DBSE[path_nmb].a);


	if(mode == 2)
		SetUsualPath(ST_name, SignalId, pathN, true);

	return true;
	}



void RemovePath(int PathName)
	{

	int path_nmb=PathLib.Find(PathName);
	if(path_nmb<0)
		return;

	PathClass P_element=cast<PathClass>(PathLib.DBSE[path_nmb].Object);

	string ST_name=P_element.StationName;
	int SignalId=P_element.SignalId;
	int pathN=P_element.pathN;
	int path_abs_nmb=Str.ToInt(PathLib.DBSE[path_nmb].a);

	if(P_element.mode>=0 and P_element.mode<4 and (cast<PathClass>(PathLib.DBSE[path_nmb].Object)).self_state==4)
		{
		Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
		Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

		int temp_id;
	

		zxSignal Sgn = cast<zxSignal>Router.GetGameObject( sv_sp.GetNamedTag("sv_n^"+SignalId) );

		zxSignal Sgn2 = cast<zxSignal>Router.GetGameObject( sp1.GetNamedTag("object_Name") );


		
		GSTrackSearch GSTS1= Sgn2.BeginTrackSearch(false);
		
		MapObject MO=GSTS1.SearchNext();



		bool other_path = false;


		while(MO and !other_path and (MO.GetId() != Sgn.GetId()))
			{
			if(MO.isclass(Trigger) and MO.GetProperties().GetNamedTagAsInt("zxPath_can_lock",-1)>= 0 )
				{
				//Interface.Log("obj_founded !!!!");
				Soup OldProp=MO.GetProperties();
				OldProp.SetNamedTag("zxPath_lock",-1);
				MO.SetProperties(OldProp);
				}
			if(MO.isclass(Junction))
				{
				temp_id=BSJunctionLib.Find( MO.GetName() );

				if((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done == path_abs_nmb)
					{
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=0;
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
					int dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).OldDirection;
					(cast<Junction>Router.GetGameObject(BSJunctionLib.DBSE[temp_id].a)).SetDirection(dir1);	
					}
				else
					other_path = true;

				}

			if(GSTS1.GetDistance()>4000 and MO.isclass(Trackside) and !MO.isclass(Vehicle) and !MO.isclass(Junction))
				{
				GSTS1=(cast<Trackside>MO).BeginTrackSearch( GSTS1.GetFacingRelativeToSearchDirection() );
				}



			MO=GSTS1.SearchNext();
			}

	
		if(Sgn.train_open and !other_path)
			{
			Sgn.train_open=false;
			Sgn.UpdateState(0, -1);
			}	
		}

	PathLib.DeleteElement(PathLib.DBSE[path_nmb].a);
	}



public bool IsSpanPath(string ST_name, int SignalId, int pathN)
	{
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	return (Str.Find(sp1.GetNamedTag("object_ending"), "@", 0) >= 0);
	}



public bool SpanDirectedCorrectly(string ST_name, int SignalId, int pathN)
	{
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	if(Str.Find(sp1.GetNamedTag("object_ending"), "@", 0) >= 0)	// �������� ����������� ������ �������
		{
		string svetofor_Mname = sp1.GetNamedTag("object_Name");
		if(svetofor_Mname != "")
			{
			zxSignal sign1 = cast<zxSignal>(Router.GetGameObject(svetofor_Mname));	
			return !sign1.wrong_dir;
			}
		}

	return true;
	}


public bool ChangeSpanDirectionFor(string ST_name, int SignalId, int pathN)
	{
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	if(Str.Find(sp1.GetNamedTag("object_ending"), "@", 0) >= 0)	// �������� ����������� ������ �������
		{
		string svetofor_Mname=sp1.GetNamedTag("object_Name");

		if(svetofor_Mname!="")
			{
			zxSignal sign1 = cast<zxSignal>(Router.GetGameObject(svetofor_Mname));

			if(sign1.wrong_dir)
				{
				GSTrackSearch GSTS_temp=sign1.BeginTrackSearch(true);
				MapObject MO8=GSTS_temp.SearchNext();
				MapObject prev=sign1;


				while(MO8 and !MO8.isclass(Junction))
					{
					if(MO8.isclass(Vehicle))
						return false;
					if(MO8.GetName()!="" and MO8.isclass(Trackside))
						prev=MO8;
					MO8=GSTS_temp.SearchNext();
					}
				if(MO8)
					{
					int temp_id3=BSJunctionLib.Find(MO8.GetName());
					if(temp_id3>=0)
						{
						if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id3].Object)).Permit_done)==0)
							return sign1.Switch_span();
						else	
							{
							JuctionWithProperties JWP1=cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id3].Object);

							int direction=(cast<Junction>MO8).GetDirection();



							if(    (prev==JWP1.back and JWP1.Poshorstnost) or (prev==JWP1.frontLeft and direction==0 and !JWP1.Poshorstnost ) or (prev==JWP1.frontRight and direction==2 and !JWP1.Poshorstnost)  )
								return false;
							else
								return sign1.Switch_span();

							}
						}
					}
				else
					return sign1.Switch_span();

				}
			}
		}
	
	return true;
	}







public bool Any_Lock(Junction JN2, int id1, int dir1, bool poshorstn,int i,int num, bool poeznoi, bool remove)
	{
	GSTrackSearch GSTS;
	MapObject MO1;
	MapObject MO0;

	if(JN2 == null)
		JN2 = cast<Junction>Router.GetGameObject( (BSJunctionLib.DBSE[id1]).a );

	JunctionBase JN = cast<JunctionBase>(JN2);

	//Interface.Log("Any lock "+JN2.GetName()+" dir1 "+dir1+" poshorstn "+poshorstn+" i "+i+" num "+num+" poeznoi "+poeznoi);

	// ����� �����, ������ ����������� ��������


	if(poshorstn)	//left/right
		GSTS=JN.BeginTrackSearch(dir1);
	else		//back
		GSTS=JN.BeginTrackSearch(JunctionBase.DIRECTION_BACKWARD);
			
	MO1=me;	



	if(i==0)
		{
		if(poeznoi)
			{
			bool is_train_signal = false;


			while(MO1 and !MO1.isclass(Junction)  and !is_train_signal)
				{
				MO1=GSTS.SearchNext();
	
				if(MO1)
					{
					if(MO1.isclass(Vehicle))
						{
						if(remove)
							{
							int dir = -1;
							if(!GSTS.GetFacingRelativeToSearchDirection())
								dir = - dir;

							float vel = (cast<Vehicle>MO1).GetVelocity();
	
							if(vel != 0)
								{
								if(vel < 0)
									dir = - dir; 
								(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
								}


							//Interface.Print(JN2.GetName() + " train found poeznoi before "+MO1.GetName() + " dir "+dir);

							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;
							}

						return true;
						}

					else if(MO1.isclass(Trigger) and !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove))
						return true;

					is_train_signal = (MO1.isclass(zxSignal) and !GSTS.GetFacingRelativeToSearchDirection() and ( (cast<zxSignal>MO1).Type & (2+4+8) ));
					}	
				}

			if(remove and is_train_signal)	// ��������� �������������� ����� ������ ��� ������������� �������, � �� ��� ����������� ��������
				{

				float prev_sign_dist = GSTS.GetDistance();

				MO1=GSTS.SearchNext();

				while(MO1 and !MO1.isclass(Vehicle) and (GSTS.GetDistance() < (prev_sign_dist + 15)))	// � ������ ���� 2 ��������� ������ ��� �������� + �������
					MO1=GSTS.SearchNext();


				if(MO1 and MO1.isclass(Vehicle))
					{
					int dir = -1;
					if(!GSTS.GetFacingRelativeToSearchDirection())
						dir = - dir;


					float vel = (cast<Vehicle>MO1).GetVelocity();
					if(vel != 0)
						{
						if(vel < 0)
							dir = - dir; 
						
						if((dir > 0) and (GSTS.GetDistance() < (prev_sign_dist + 15)))
							{
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

							//Interface.Print(JN2.GetName() + " train found before signal "+MO1.GetName()+" dir "+dir);
							return true;
							}
						}

					//Interface.Print(JN2.GetName() + " train checked but not released "+MO1.GetName()+" dir "+dir + " vel "+vel);
					}
				}
			}
		else
			{
			while(MO1 and (!MO1.isclass(Junction) and !MO1.isclass(Signal)))
				{
				MO1=GSTS.SearchNext();

				if(MO1.isclass(Vehicle))
					{
					if(remove)
						{
						int dir = -1;
						if(!GSTS.GetFacingRelativeToSearchDirection())
							dir = - dir;

						float vel = (cast<Vehicle>MO1).GetVelocity();
						if(vel != 0)
							{
							if(vel < -0.000001)
								dir = - dir; 
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
							}

						//Interface.Print(JN2.GetName() + " train found shunt before "+MO1.GetName()+" dir "+dir);
	
						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;
						}
					return true;
					}	

				else if(MO1.isclass(Trigger) and !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove))
					return true;
				}

			if(remove and MO1 and !MO1.isclass(Junction))	// ������������ ������ �� ������� ����������, �� ���������� �� ����� 15 ������, ������ ��� ������������ ��������
				{
				float prev_sign_dist = GSTS.GetDistance();

				MO1=GSTS.SearchNext();

				while(MO1 and !MO1.isclass(Vehicle) and (GSTS.GetDistance() < (prev_sign_dist + 15)))	// � ������ ���� 2 ��������� ������ ��� �������� + �������
					MO1=GSTS.SearchNext();


				if(MO1 and MO1.isclass(Vehicle))
					{
					int dir = -1;
					if(!GSTS.GetFacingRelativeToSearchDirection())
						dir = -dir;

					float vel = (cast<Vehicle>MO1).GetVelocity();
					if(vel != 0)
						{
						if(vel < -0.000001)
							dir = - dir; 
						
						if((dir > 0) and (GSTS.GetDistance() < (prev_sign_dist + 15)))
							{
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);

							//Interface.Print(JN2.GetName() + " train found shunt before signal "+MO1.GetName()+" dir "+dir);

							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;
							return true;
							}
						}

					//Interface.Print(JN2.GetName() + " train checked but not released shunt "+MO1.GetName()+" dir "+dir + " vel "+vel);
					}
				}
			}
		}
	else
		{
		while(MO1 and !MO1.isclass(Junction) )
			{
			MO1=GSTS.SearchNext();

			if(MO1)
				{
				if(MO1.isclass(Vehicle))
					{
					if(remove)
						{
						int dir = -1;
						if(!GSTS.GetFacingRelativeToSearchDirection())
							dir = - dir;

						float vel = (cast<Vehicle>MO1).GetVelocity();

						if(vel != 0)
							{
							if(vel < -0.000001)
								dir = - dir; 
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
							}

						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

						//Interface.Print(JN2.GetName() + " train found before "+MO1.GetName() + " dir "+dir);
						}

					return true;
					}

				else if(MO1.isclass(Trigger) and !(remove or MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0))
					return true;
				}	
			}


		if(remove and MO1)
			{

			float prev_sign_dist = GSTS.GetDistance();

			MO1=GSTS.SearchNext();

			while(MO1 and !MO1.isclass(Vehicle) and (GSTS.GetDistance() < (prev_sign_dist + 15)))	// � ������ ���� 2 ��������� ������ ��� �������� + �������
				MO1=GSTS.SearchNext();


			if(MO1 and MO1.isclass(Vehicle))
				{
				int dir = -1;
				if(!GSTS.GetFacingRelativeToSearchDirection())
					dir = - dir;

				float vel = (cast<Vehicle>MO1).GetVelocity();
				if(vel != 0)
					{
					if(vel < -0.000001)
						dir = - dir; 
						
					if((dir > 0) and (GSTS.GetDistance() < (prev_sign_dist + 15)))
						{
						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);

						//Interface.Print(JN2.GetName() + " train found shunt before signal "+MO1.GetName()+" dir "+dir);

						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;
						return true;
						}
					}

				//Interface.Print(JN2.GetName() + " train checked but not released shunt "+MO1.GetName()+" dir "+dir + " vel "+vel);
				}
			}
		}

	// �������� ������������ ��������� � ������� �������� ����


	// ����� �����, �� ����������� ��������




	float min_dist;

	float extra_dist = 35;

	if(!poeznoi)
		extra_dist = 70;

	if(poshorstn)
		{	
		GSTS=JN.BeginTrackSearch(JunctionBase.DIRECTION_BACKWARD);
		min_dist = 5;
		}
	else	
		{	
		GSTS=JN.BeginTrackSearch(dir1);
		min_dist = 40;
		}

	MO1=me;

	while(MO1 and (GSTS.GetDistance() < (min_dist+extra_dist)) and !MO1.isclass(Vehicle) )
		{
		MO1=GSTS.SearchNext();
		if(MO1 and MO1.isclass(Vehicle) )
			{
			int dir = 1;
			if(!GSTS.GetFacingRelativeToSearchDirection())
				dir = - dir;

			float vel = (cast<Vehicle>MO1).GetVelocity();



			if(remove and (vel != 0))
				{
				if(vel < 0)
					dir = - dir;
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
				}

			if(remove)
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

			if(GSTS.GetDistance() < (min_dist+(cast<Vehicle>MO1).GetLength()/2))
				{
				//Interface.Print(JN2.GetName() + " vehicle near junction  "+MO1.GetName() + " dir "+dir);
				return true;
				}
			}	
		}

	//Interface.Print(JN2.GetName() + " no train found on poshorstn "+ poshorstn);


	if(i==(num-1) and poeznoi)	// �������� ������������ ������� �� ���������� ��������� ��������� (����������� �� �����)
		{
		if(poshorstn)	//left/right
			GSTS=JN.BeginTrackSearch(JunctionBase.DIRECTION_BACKWARD);
		else		//back
			GSTS=JN.BeginTrackSearch(dir1);

		MO1=me;
			
		while(MO1 and !MO1.isclass(Junction)  and !(MO1.isclass(zxSignal) and ( (cast<zxSignal>MO1).Type & (2+4+8)))) // ����������� ��������� �� �����
			{
			MO1=GSTS.SearchNext();
	
			if(MO1)
				{
				if(MO1.isclass(Vehicle))
					{
					if(remove)
						{
						int dir = 1;
						if(!GSTS.GetFacingRelativeToSearchDirection())
							dir = - dir;

						float vel = (cast<Vehicle>MO1).GetVelocity();

						if(vel != 0)
							{
							if(vel < 0)
								dir = - dir; 
							(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).LastTrainVelDir = (dir > 0);
							}

						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

						//Interface.Print(JN2.GetName() + " vehicle before junction "+MO1.GetName() + " dir "+dir);
						}

					return true;
					}


				else if(MO1.isclass(Trigger) and !(remove or MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0))
					return true;

				}	
			}
		}


// ����� ��� ����� ��������


	JuctionWithProperties JWP=cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object);
	MO1=JWP.back;
	bool str_dir = JWP.back_dir;


	if(MO1.isclass(Junction))
		{
		int other_id = BSJunctionLib.Find(MO1.GetName());
		if(other_id < 0)
			{
			if(remove)
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = false;
			return false;
			}

		int next_dir = JunctionBase.DIRECTION_BACKWARD;

		MO0 = cast<MapObject>JN2;

		if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[other_id]).Object)).frontLeft==MO0)
			next_dir = 0;
		else if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[other_id]).Object)).frontRight==MO0)
			next_dir = 2;

		GSTS=(cast<JunctionBase>(cast<Junction>MO1)).BeginTrackSearch(next_dir);
		}
	else
		GSTS=(cast<Trackside>MO1).BeginTrackSearch(!str_dir);
	
	MapObject MO2 = MO1;

	float prev_veh_dist = -1.0;
	MO1= me;


	while(!MO1.isclass(Junction))
		{
		MO1=GSTS.SearchNext();
		if(!MO1)				// ������ ������� ?
			{
/*			if(remove)
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = false;*/
 			return false;
			}
			
		if(MO1.isclass(Vehicle))
			prev_veh_dist = GSTS.GetDistance();
		}

	if(MO1.isclass(Junction))
		{
		float curr_jun_dist = GSTS.GetDistance();

		if(prev_veh_dist >= 0.0)
			{
			if((curr_jun_dist - prev_veh_dist) < 10)
				{
				if(remove)
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

				//Interface.Print("curr_jun_dist "+curr_jun_dist + " prev_veh_dist " + prev_veh_dist + " of junction "+MO1.GetName());
				return true;
				}
			}
		else
			{
			string junct_name = MO1.GetName();

			MO1=GSTS.SearchNext();

			if(MO1 and MO1.isclass(Vehicle))
				{
				if((GSTS.GetDistance() - curr_jun_dist) < 5)
					{
					if(remove)
						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = true;

					//Interface.Print(junct_name + " 2_jun_dist "+curr_jun_dist + " prev_veh_dist " + prev_veh_dist + " of junction "+MO1.GetName());
					return true;
					}
				}
			}
		}
	if(remove)
		(cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object)).TrainFound = false;

	return false;
	}


public bool Simple_Lock(Junction JN, int id1)
	{
	GSTrackSearch GSTS;

	JuctionWithProperties JWP=cast<JuctionWithProperties>(BSJunctionLib.DBSE[id1].Object);
	MapObject MO1=JWP.back;
	bool str_dir = JWP.back_dir;


	if(MO1.isclass(Junction))
		{
		int other_id = BSJunctionLib.Find(MO1.GetName());
		if(other_id < 0)
			return false;

		int next_dir = JunctionBase.DIRECTION_BACKWARD;

		MapObject MO0 = cast<MapObject>JN;

		if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[other_id]).Object)).frontLeft==MO0)
			next_dir = 0;
		else if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[other_id]).Object)).frontRight==MO0)
			next_dir = 2;

		GSTS=(cast<JunctionBase>(cast<Junction>MO1)).BeginTrackSearch(next_dir);
		}
	else
		GSTS=(cast<Trackside>MO1).BeginTrackSearch(!str_dir);
	
	MapObject MO2 = MO1;

	float prev_veh_dist = -1.0;
	MO1= me;


	while(!MO1.isclass(Junction))
		{
		MO1=GSTS.SearchNext();
		if(!MO1)
			{
			return false;
			}
			
		if(MO1.isclass(Vehicle))
			prev_veh_dist = GSTS.GetDistance();
		}

	if(MO1.isclass(Junction))
		{
		float curr_jun_dist = GSTS.GetDistance();

		if(prev_veh_dist >= 0.0)
			{
			if((curr_jun_dist - prev_veh_dist) < 10)
				return true;
			}
		else
			{
			MO1=GSTS.SearchNext();

			if(MO1 and MO1.isclass(Vehicle))
				{
				if((GSTS.GetDistance() - curr_jun_dist) < 5)
					return true;
				}
			}
		}

	return false;
	}






bool CheckJunctionsAreFree(string ST_name, int SignalId, int pathN)
	{
	GSTrackSearch GSTS_temp;

	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	int i;

	string end_obj=sp1.GetNamedTag("object_ending");


	zxSignal sign1, sign2;

	if(Str.Find(end_obj, "@", 0) >= 0)	// �������� ����������� ������ �������
		{
		Soup sv_sp2=StationProperties.GetNamedSoup(TrainUtil.GetAfter(end_obj,"@") +".svetof_soup");

		if(sv_sp2)
			{
			int JunctionsNumber1=sp1.GetNamedTagAsInt("NumberOfObjects",0);

			if(JunctionsNumber1==0)
				return true;

			int[] junction_id = new int[JunctionsNumber1];

			i=0;
			while(i<JunctionsNumber1)	// ����������� ����������� �������
				{

				junction_id[i]=BSJunctionLib.Find(TrainUtil.GetUpTo(sp1.GetNamedTag("object_"+i),","));
				
				if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[ junction_id[i] ].Object)).Permit_done)!=0)
					return false;

				i++;		
				}

			i=0;
			while(i<JunctionsNumber1)	// ����������� ����������� �������, �������������
				{
				string[] tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");

				bool any_lock = Any_Lock(null, junction_id[i], Str.ToInt(tmpstr2[1]), (tmpstr2[2]=="1"),i,JunctionsNumber1,true, false);

				tmpstr2[0] = null;
				tmpstr2[1] = null;
				tmpstr2[2] = null;
				tmpstr2[0,] = null;

				if(any_lock)
					return false;

				i++;		
				}




			return true;
			}
		return false;
		}
	else				// ������� �� �������
		{
		
			string svetofor_Mname=sp1.GetNamedTag("object_Name");

			sign1 = cast<zxSignal>(Router.GetGameObject(svetofor_Mname));	
			if(!sign1)
				{
				Interface.Exception("Not found signal with name '"+svetofor_Mname+"' in "+ ST_name +" sv#"+SignalId+" path#"+pathN);
				return false;
				}
			
			// �������� ��������� ������ �����


			GSTS_temp=sign1.BeginTrackSearch(false);
			MapObject MO8=GSTS_temp.SearchNext();

			while(MO8 and !MO8.isclass(Junction))
				{
				if(MO8.isclass(Vehicle))
					{
					return false;
					}
				MO8=GSTS_temp.SearchNext();
				}

// �������� ���������� ��������� ��������� ��� ��������� ������ ������� �� ���: ���� ��� ������ � ���������� �� ���, ���� �����


			if(sign1.MainState == 0 or sign1.MainState == 1 or sign1.MainState == 2)
				{
				GSTS_temp= sign1.BeginTrackSearch(true);
				MapObject MO=GSTS_temp.SearchNext();
				MapObject prev=sign1;

				

				while(MO and !MO.isclass(Junction)) 
					{
					if(MO.isclass(Vehicle))
						{
						return false;
						}
					if(MO.GetName()!="" and MO.isclass(Trackside))
						prev=MO;
					MO=GSTS_temp.SearchNext();
					}


				Junction J453=cast<Junction>MO;

				if(J453)
					{
					int j_id1= BSJunctionLib.Find(J453.GetName());
					if(j_id1>=0)
						{
						if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[j_id1].Object)).Permit_done)!=0)
							{
			
							JuctionWithProperties JWP1=cast<JuctionWithProperties>(BSJunctionLib.DBSE[j_id1].Object);


//er45="prev= "+prev.GetName()+" JWP1.back "+JWP1.back.GetName()+"JWP1.frontLeft"+JWP1.frontLeft.GetName()+"JWP1.frontRight"+JWP1.frontRight.GetName();
//Interface.Log(er45);


							if(prev==JWP1.back and JWP1.Poshorstnost   )
								return false;

							int direction=J453.GetDirection();

							if(prev==JWP1.frontLeft and direction==0 and !JWP1.Poshorstnost )
								return false;

							if(prev==JWP1.frontRight and direction==2 and !JWP1.Poshorstnost )
								return false;

							}
						}
					}
				}

			int JunctionsNumber1=sp1.GetNamedTagAsInt("NumberOfObjects",0);

			if(JunctionsNumber1==0)
				return true;

			
			int[] junction_id = new int[JunctionsNumber1];

			i=0;
			while(i<JunctionsNumber1)	// ����������� ����������� �������
				{
				junction_id[i]=BSJunctionLib.Find(TrainUtil.GetUpTo(sp1.GetNamedTag("object_"+i),","));

				if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[ junction_id[i] ].Object)).Permit_done)!=0)
					return false;

				i++;		
				}

			i=0;
			while(i<JunctionsNumber1)	// ����������� ����������� �������, �������������
				{

				string[] tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
				
				bool any_lock = Any_Lock(null, junction_id[i], Str.ToInt(tmpstr2[1]), (tmpstr2[2]=="1"),i,JunctionsNumber1,true, false);

				tmpstr2[0] = null;
				tmpstr2[1] = null;
				tmpstr2[2] = null;
				tmpstr2[0,] = null;

				if(any_lock)
					return false;
				i++;		
				}
					
			return true;
		}
	return false;
	}




public bool main_checking = false;
int main_check_i = 0;


void ProcessMainChecking()
	{

	while(main_check_i<PathLib.N)
		{
		if(CheckPath(main_check_i))
			main_check_i++;

		if((main_check_i % 20) == 0)
			{
			PostMessage(me,"SelfTimedMessage", "ProcessMainChecking",0.1);
			return;
			}
		}

	PostMessage(me,"z7-xPath", "Update",0.0);
	main_checking = false;

	}




public void MainChecker()
	{
	RemovePath(CancelPath);

	main_check_i = 0;		// ������� ������������ � ������

	if(main_checking)
		return;

	main_checking = true;

	PostMessage(me,"SelfTimedMessage", "ProcessMainChecking",0.0);
	}




public bool CheckPathIsFree(string ST_name, int SignalId, int pathN) 
	{
	bool result=true;
	int MyCurrentPath=CurrentPath;
	CurrentPath++;

	PathClass PCS1=new PathClass();
	int number8=PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);
			
	
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	(cast<PathClass>(PathLib.DBSE[number8].Object)).mode=3;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).self_state=0;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).StationName=ST_name;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).description="!";
	(cast<PathClass>(PathLib.DBSE[number8].Object)).SignalId=SignalId;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).pathN=pathN;

	return CheckPath(number8);
	}



public void SetUsualPath(string ST_name, int SignalId, int pathN, bool Locked)
	{
	int MyCurrentPath=CurrentPath;
	CurrentPath++;

	PathClass PCS1=new PathClass();
	int number8=PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);

	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	string end_obj=sp1.GetNamedTag("object_ending");

	StationProperties.SetNamedTag(ST_name +".linkedpath",MyCurrentPath);

	(cast<PathClass>(PathLib.DBSE[number8].Object)).self_state=0;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).StationName=ST_name;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).description=GetAsset().GetStringTable().GetString("from_") + sv_sp.GetNamedTag("sv^"+SignalId)+ GetAsset().GetStringTable().GetString("to_") +end_obj;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).SignalId=SignalId;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).pathN=pathN;


	if(Locked)
		{
		(cast<PathClass>(PathLib.DBSE[number8].Object)).mode=2;
		(cast<PathClass>(PathLib.DBSE[number8].Object)).description= (cast<PathClass>(PathLib.DBSE[number8].Object)).description+" !";
		}
	else
		(cast<PathClass>(PathLib.DBSE[number8].Object)).mode=0;


	CheckPath(number8);
	}





public void SetLinkedPath(string ST_name, int SignalId, int pathN)
	{
	int MyCurrentPath=CurrentPath;
	CurrentPath++;

	PathClass PCS1=new PathClass();

	int number8=PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);
	

	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	string end_obj=sp1.GetNamedTag("object_ending");


	(cast<PathClass>(PathLib.DBSE[number8].Object)).mode=1;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).self_state=0;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).StationName=ST_name;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).description=GetAsset().GetStringTable().GetString("from_") + sv_sp.GetNamedTag("sv^"+SignalId)+ GetAsset().GetStringTable().GetString("to_") +end_obj+" ^";
	(cast<PathClass>(PathLib.DBSE[number8].Object)).SignalId=SignalId;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).pathN=pathN;
	(cast<PathClass>(PathLib.DBSE[number8].Object)).linkedpath=StationProperties.GetNamedTagAsInt(ST_name +".linkedpath",-1);

	StationProperties.SetNamedTag(ST_name +".linkedpath",MyCurrentPath);

	CheckPath(number8);
	}





void PathHander(Message msg)
	{
	if(!IsInited or !IsInited2)
		return;
	int i,L;
	if(!pathSoup)
		{
		L=StationProperties.GetNamedTagAsInt("st_Number",0);
		pathSoup=new Soup[L];
		for(i=0;i<L;i++)
			pathSoup[i]=Constructors.NewSoup();	
		}
	}



public bool RemoveNeighbPath(int temp_id, bool poshorstn, int dir1)
	{
	JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[temp_id]).Object);


	GSTrackSearch GSTS;
	MapObject MO1;
	MapObject MO0;


	MapObject Previous;

	bool str_dir;


	
	if(poshorstn)
		{
		//left/right

		if(dir1==0)
			{
			MO1=JWP.frontLeft;
			str_dir=JWP.frontLeft_dir;
			}							
		else
			{
			MO1=JWP.frontRight;
			str_dir=JWP.frontRight_dir;
			}
		}
	else
		{
		//back
						
		MO1=JWP.back;
		str_dir=JWP.back_dir;
		}

	if(!MO1)
		return false;

	MO0 = MO1;

	if(!MO1.isclass(Junction))
		{
		GSTS=(cast<Trackside>MO1).BeginTrackSearch((bool)str_dir);
		
		bool TempStrDir = str_dir;



		while(MO1 and !MO1.isclass(Junction))
			{
			if( MO1.isclass(Trackside) and MO1.GetName()!="")
				Previous=MO1;

			MO1=GSTS.SearchNext();
			TempStrDir = GSTS.GetFacingRelativeToSearchDirection();

			if(!MO1 or MO1.isclass(Vehicle) )
				return false;	
			}
	
		if(!MO1)
			return false;
		}

	bool poeznoi = true;

	int temp_id2=BSJunctionLib.Find( MO1.GetName() );


	int Path_tmp_nmb=(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id2].Object)).Permit_done;

	if(Path_tmp_nmb<=1)
		return false;

	int p_element_n=PathLib.Find(Path_tmp_nmb);

	if(p_element_n>=0 and (cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode>=0)
		{

		if((cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode == 4)
			{
			poeznoi = false;
			}
		}


	if(!poeznoi and ((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id2].Object)).Poshorstnost == ThisJPoShorstn(temp_id2, Previous)) and (TrueJdir(temp_id2, Previous)<0 or TrueJdir(temp_id2, Previous) == (cast<Junction>MO1).GetDirection() ) )	//������� �������� �� ��� � ������������ ������
		{
		GSTS=(cast<Trackside>MO0).BeginTrackSearch(!(bool)str_dir);
		MO1=MO0;
		while(MO1 and !MO1.isclass(Junction) )
			{
			MO1=GSTS.SearchNext();
			if(MO1.isclass(Vehicle) )
				return false;	
			}



		GSTS=(cast<Trackside>MO0).BeginTrackSearch(str_dir);
		MO1=MO0;


		bool other_path = false;

		while(MO1 and !other_path)
			{

			if(MO1.isclass(Vehicle) )
				return false;	


			if(MO1.isclass(Trigger) and MO1.GetProperties().GetNamedTagAsBool("zxPath_can_lock",false))
				{
				Soup OldProp=MO1.GetProperties();
				OldProp.SetNamedTag("zxPath_lock",-1);
				MO1.SetProperties(OldProp);
				}
			else if(MO1.isclass(Junction))
				{
				temp_id=BSJunctionLib.Find( MO1.GetName() );

				if((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done == Path_tmp_nmb)
					{
				//	Interface.Log("NeighbPath junction "+MO1.GetName()+" relrased "+Path_tmp_nmb);

					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=0;
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Message_perm = 0;
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
					int dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).OldDirection;
					(cast<Junction>Router.GetGameObject(BSJunctionLib.DBSE[temp_id].a)).SetDirection(dir1);	
					}
				else
					other_path = true;
				}
			else if(MO1.isclass(zxSignal))
				{
				zxSignal zxtemp = cast<zxSignal>MO1;
				zxtemp.shunt_open = false;
				zxtemp.UpdateState(0,-1);
				}
	
			MO1=GSTS.SearchNext();
			}



		return true;
		}

	return false;

	}

thread void xtriggerThread(Trigger trig)
	{

	GSTrackSearch GSTS;
	MapObject MO;

	bool end_w = false;
	
	int old_path = trig.GetProperties().GetNamedTagAsInt("zxPath_lock");


	while(!end_w and trig.GetProperties().GetNamedTagAsInt("zxPath_lock") == old_path )
		{
		end_w = true;

		MO = trig;

		GSTS = trig.BeginTrackSearch(true);

		while(MO and !MO.isclass(Signal) and !MO.isclass(Junction))
			{
			MO = GSTS.SearchNext();
			if(MO and MO.isclass(Vehicle))
				end_w = false;
			}
		
		if(MO and MO.isclass(Junction))
			{
			int temp_id=BSJunctionLib.Find(MO.GetName());
			if(temp_id>=0 and (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done == old_path)
				end_w = false;
			}



		if(end_w)
			{
			MO = trig;
			GSTS = trig.BeginTrackSearch(false);

			while(MO and !MO.isclass(Signal) and !MO.isclass(Junction))
				{
				MO = GSTS.SearchNext();
				if(MO and MO.isclass(Vehicle))
					end_w = false;
				}

			if(MO and MO.isclass(Junction))
				{
				int temp_id=BSJunctionLib.Find(MO.GetName());
				if(temp_id>=0 and (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done == old_path)
					end_w = false;
				}
			}

		if(!end_w)
			Sleep(1);

		}

	if(trig.GetProperties().GetNamedTagAsInt("zxPath_lock") != old_path)
		return;

	Soup OldProp=trig.GetProperties();
	OldProp.SetNamedTag("zxPath_lock",-1);
	trig.SetProperties(OldProp);

	}

void LeavingHandler1(Message msg)
	{
	GameObject GO=cast<GameObject>(msg.dst);
	string junct_name=GO.GetName();	

	if(GO.isclass(Junction))
		{
		int temp_id=BSJunctionLib.Find(junct_name);

		if(temp_id<0)
			return;

		JuctionWithProperties currJWP = cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object);


		int Path_tmp_nmb=currJWP.Permit_done;

		int message_path_num = currJWP.Message_perm;


		if((msg.minor=="InnerEnter") and (Path_tmp_nmb==0))
			{
			currJWP.PrevJunction= -1;
			currJWP.Permit_done= 1;
			currJWP.Message_perm= 1;

			PostMessage( GO , "ObjectLeftCheck", "1", 2.0);
			}

		else if((msg.minor=="InnerEnter") or ((msg.major == "ObjectLeftCheck") and (Str.ToInt(msg.minor)==message_path_num) and (Path_tmp_nmb==message_path_num)))	
			{
// �������� �������� �� ������������ �������


			if(Path_tmp_nmb == 0)
				return;

			Junction curr_junct = cast<Junction>GO;
			
			int p_element_n=PathLib.Find(Path_tmp_nmb);


			

			if(p_element_n>=0 and (cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode>=0)
				{

				bool poeznoi = true;

				int mode1 = (cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode;

				if(mode1 == 4)
					poeznoi = false;

				
				int pos = currJWP.JunctPos;


				int num_jun = 3;


				if(pos == 3)
					{
					pos = 0;
					num_jun = 1;
					}

				bool result_l = Any_Lock(curr_junct, temp_id ,  curr_junct.GetDirection() , currJWP.Poshorstnost, pos, num_jun, poeznoi,true);

				//Interface.Log("any_lock_res "+result_l);

				if(!currJWP.TrainFound and !currJWP.LastTrainVelDir) // ����� ���� � �������� �����������, �� �������� ������������ ?
					{

					//Interface.Print("train moved in reverse direction "+BSJunctionLib.DBSE[temp_id].a);

					currJWP.Message_perm = 0;
					processing_junctions.RemoveNamedTag(temp_id);
					return;
					}


				if(result_l)
					{

					if((msg.major == "ObjectLeftCheck") and (currJWP.Message_perm == Path_tmp_nmb))
						PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
					else if(currJWP.Message_perm != Path_tmp_nmb)
						{
						processing_junctions.SetNamedTag(temp_id,Path_tmp_nmb);

						PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
						currJWP.Message_perm = Path_tmp_nmb;
						}
					return;
					}
				else
					{
					if(currJWP.JunctPos!=0 and currJWP.JunctPos!=3)
						{
						int other_jn = currJWP.PrevJunction;
						if(other_jn>=0)
							{
	
							if((cast<JuctionWithProperties>(BSJunctionLib.DBSE[other_jn].Object)).Permit_done ==  Path_tmp_nmb)	// ���� ���������� ������� �������� �� �����������, ��� ���� �� ����� ������������
								{
								//Interface.Print("previous junction not released "+BSJunctionLib.DBSE[other_jn].a);


								if(msg.major == "ObjectLeftCheck")
									PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
								else if(currJWP.Message_perm != Path_tmp_nmb)
									{
									PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
									currJWP.Message_perm = Path_tmp_nmb;
									}
								return;
								}
							}
						}

					Permit tmp_permit = curr_junct.RequestPermit(me, currJWP.OldDirection);
					bool permit_state = tmp_permit.IsGranted();
					tmp_permit.Release();

					if(!permit_state)
						{

						//Interface.Print("Permit cannot released "+BSJunctionLib.DBSE[temp_id].a);

						if((msg.major == "ObjectLeftCheck") and (currJWP.Message_perm == Path_tmp_nmb))
							PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
						else if(currJWP.Message_perm != Path_tmp_nmb)
							{
							processing_junctions.SetNamedTag(temp_id,Path_tmp_nmb);
							PostMessage( GO , "ObjectLeftCheck", ""+Path_tmp_nmb, 2.0);
							currJWP.Message_perm = Path_tmp_nmb;
							}
						return;
						}



					processing_junctions.RemoveNamedTag(temp_id);


					if(!poeznoi and pos == 0)
						RemoveNeighbPath(temp_id, currJWP.Poshorstnost,(cast<Junction>GO).GetDirection() );

					
					//Interface.Log("Usual releasing "+junct_name+ " from permit "+Path_tmp_nmb + " with message " + (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Message_perm);


					currJWP.Permit_done=0;
					currJWP.Message_perm = 0;
					currJWP.PrevJunction= -1;
					int dir1 =currJWP.OldDirection;
					curr_junct.SetDirection(dir1);	

					MainChecker();		//��������	
					}
				}
			else
				{

				// ������� ����, ��� ����� �� ��������� ��� ��������

				if((Path_tmp_nmb == 1) and Simple_Lock(curr_junct, temp_id))
					{
					if((msg.major == "ObjectLeftCheck") and (msg.minor=="1"))
						PostMessage( GO , "ObjectLeftCheck", "1", 2.0);
					}
				else
					{
					currJWP.Permit_done=0;
					currJWP.Message_perm = 0;
					currJWP.PrevJunction= -1;

					MainChecker();		//��������
					}
				}

	

			}
		}


	else if(GO.isclass(Trigger) and msg.minor=="Leave")
		{
		Soup OldProp=(cast<Trigger>GO).GetProperties();
		if(OldProp.GetNamedTagAsBool("zxPath_can_lock",false))
			{
			if(TrainzScript.GetTrainzVersion() < 3.7)
				{
				OldProp.SetNamedTag("zxPath_lock",-1);
				(cast<Trigger>GO).SetProperties(OldProp);
				}
			else
				xtriggerThread(cast<Trigger>GO);
			}
		}
	}

void setSettings()
	{
	int i,j,k;

	Trigger[] t_list4=World.GetTriggerList();


	for(i=0;i<t_list4.size();i++)
		if(t_list4[i].GetProperties().GetNamedTagAsBool("zxPath_can_lock",false))
			Sniff(t_list4[i],"Object", "Leave",true);
	}


public bool InitPathClean_Sent = false;



public bool SelfTimedHandler(Message msg)
	{
	if(msg.minor == "InitPathCleaner")
		{
		Junction[] j_list4=World.GetJunctionList();

		int i;
		for(i=0;i<j_list4.size();i++)
			{
			Sniff(j_list4[i],"Object", "",true);
			Sniff(j_list4[i],"ObjectLeftCheck", "",true);
			}

		AddHandler(me,"Object", "","LeavingHandler1");
		AddHandler(me,"ObjectLeftCheck", "","LeavingHandler1");

		setSettings();



		int N = processing_junctions.CountTags();
		
		for(i=0;i<N;i++)
			{

			int j_id = Str.ToInt(processing_junctions.GetIndexedTagName(i));
			Junction jn = cast<Junction>( Router.GetGameObject( BSJunctionLib.DBSE[j_id].a ) );
	
			string mesge = processing_junctions.GetNamedTag( processing_junctions.GetIndexedTagName(i) );

			PostMessage(jn , "ObjectLeftCheck", ""+mesge, 0.0);
			}

		InitPathClean_Sent = false;

		return true;
		}

	if(msg.minor == "SelfTimedMessage")
		{
		ProcessMainChecking();
		return true;
		}


	if(msg.minor == "PathMaking")
		{
		ProcessPathMaking();
		return true;
		}




	return false;
	}



public void PropertyBrowserRefresh(Browser browser)
	{
	been_refreshing = true;
	inherited(browser);

	sub_browser = browser;
	been_refreshing = false;
	}




public void InitPathCleaner()
	{
	if(InitPathClean_Sent)
		return;

	InitPathClean_Sent = true;

	PostMessage(me, "SelfTimedMessage", "InitPathCleaner", 0.0);
	}



};




