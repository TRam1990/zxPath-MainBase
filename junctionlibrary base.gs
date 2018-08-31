include "junction.gs"
include "signal.gs"
include "xtrainz01s.gs"
include "zx_specs.gs"


class JuctionWithProperties isclass GSObject
{

public MapObject back;			//объект сзади
public int back_dir;			//0 - направление "обратное", 1- направление "прямое", -1 - это стрелка (направление определять по свойствам)

public MapObject frontLeft;		//объект впереди, по стрелке слева
public int frontLeft_dir;

public MapObject frontRight;		//объект впереди, по стрелке слева
public int frontRight_dir;

public int directionF;			//отклонение : 0 - налево, 2 - направо
public int OldDirection;

public int Permit_done;			//маршрут по стрелке проложен, если число > 0  (занятая неизвестным маршрутом: 1 ). Стрелка свободна если = 0. 

public bool Poshorstnost;		//пошёрстное/противошёрстное направление стрелки в маршруте
public int JunctPos;			//стрелка явяется у собранного маршрута 0 - первой, 1 - промежуточной, 2 -последней, 3 - одновременно первой и последней.

public int PrevJunction;		//ID предыдущей стрелки в маршруте

public string LinkedSignal;		//поездной сигнал, освобождающий стрелку

};


class LightJunctionObject isclass GSObject
{
public bool WasInLeft=false;

public bool ExistedInThisSearch=false;
public bool Poshorstna=false;
};



class PathClass isclass GSObject
{
public int mode=-1; //режим. 


// 0 - непрерывно пытаться собрать маршрут, в том числе переключая перегон
// 1 - непрерывно пытаться собрать маршрут, когда предыдущий маршрут, заданный по этой станции будет замкнут или освобождён
// 2 - маршрут заблокирован (если его принудительно не разбирать, самовосстанавливается)
// 3 - определение возможности немедленной постройки маршрута
// 4 - маневровый маршрут (данным модулем не обрабатывается)

 
public int self_state; //состояние 

// 0 - ожидание изменения направления перегона
// 1 - направление перегона верное, скрелки заняты другим маршрутом
// 2 - ожидается изменение направления перегона на следующем шаге
// 3 - маршрут готов к сборке
// 4 - маршрут замкнут

public string StationName;
public string description;

public int SignalId;
public int pathN;	// уникальный номер маршрута

public int linkedpath=-1; 	// маршрут, сборка которого ожидается в случае self_state 1 
}; 

 



class zxMainJunctionControllerBase isclass Buildable
{

public BinarySortedArrayS BSJunctionLib;

public Soup StationProperties;

public BinarySortedArrayS2 PathLib;


BinarySortedArrayS JunctionsOfStation;

public Soup cache2;

public bool IsInited=false;
public bool IsInited2=false;


public int CurrentPath=2;
public int CancelPath=-1;


Soup[] pathSoup;
PathClass PCS1;

bool IsChecking=false;

public int max_path_number=100;


string er45;



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

	if(size11<=0)
		{
		PathLib.UdgradeArraySize(100);
		return;
		}

	PathLib.UdgradeArraySize(size11);

	string P_name;

	PathLib.N=size11;

	PathClass[] P_element=new PathClass[size11];


	for(i=0;i<size11;i++)
		{
		P_element[i]=new PathClass();
		P_name=sp7.GetNamedTag((string)("soup_name_"+i));

		P_element[i].mode = sp7.GetNamedTagAsInt(P_name+".mode",0);
		P_element[i].self_state = sp7.GetNamedTagAsInt(P_name+".self_state",0);


		P_element[i].StationName = sp7.GetNamedTag(P_name+".StationName");
		P_element[i].description = sp7.GetNamedTag(P_name+".description");
		P_element[i].SignalId = sp7.GetNamedTagAsInt(P_name+".SignalId",0);
		P_element[i].pathN = sp7.GetNamedTagAsInt(P_name+".pathN",0);
		P_element[i].linkedpath = sp7.GetNamedTagAsInt(P_name+".linkedpathN",-1);


		PathLib.DBSE[i].a =P_name;
		PathLib.DBSE[i].Object=cast<GSObject>P_element[i];
		}
	}







public int FindJunctionPropertiesId(Junction Current)
	{
	return BSJunctionLib.Find(Current.GetName(),false);
	}


public MapObject MakeSearchByJunctions(int JunctionPropId, MapObject previous, int J_direction )
	{
	JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object);

	if(JWP.frontLeft==previous or JWP.frontRight==previous)
		return JWP.back;

	if(JWP.back == previous)
		{
		if(J_direction == Junction.DIRECTION_LEFT)
			return JWP.frontLeft;
		else
			return JWP.frontRight;
		}

	return JWP.back;
	}




public int GetDirectionByJunctions(int JunctionPropId, MapObject previous, int J_direction )
	{
	JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object);

	if(JWP.frontLeft==previous or JWP.frontRight==previous)
		return JWP.back_dir;

	if(JWP.back == previous)
		{
		if(J_direction == Junction.DIRECTION_LEFT)
			return JWP.frontLeft_dir;
		else
			return JWP.frontRight_dir;
		}

	return JWP.back_dir;
	}


public bool ThisJPoShorstn(int JunctionPropId, MapObject previous)
	{
	JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object);

	if(JWP.frontLeft==previous or JWP.frontRight==previous)
		return true;
	return false;


	}



public int TrueJdir(int JunctionPropId, MapObject previous)
	{
	JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionPropId]).Object);

	if(JWP.frontLeft==previous)
		return 0;

	if(JWP.frontRight==previous)
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



bool CheckForTheLastestJunctionFromTheEnd(Soup PathSoup)
	{
	if(!PathSoup)
		return true;

	int i=PathSoup.GetNamedTagAsInt("NumberOfObjects",-1) -1;
	if(i<0)
		return false;
	

	string[] tokens;
	int JunctLghtId;


	while(i>=0)
		{
		tokens= Str.Tokens(PathSoup.GetNamedTag("object_"+i),",");
		JunctLghtId= JunctionsOfStation.Find(tokens[0],false);
		if(JunctLghtId<0)
			{
			string str11="can't find "+tokens[0];
			Interface.Log(str11);
			}
		else
			if(!(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft and !(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna)
				{
				(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=true;
				i++;
				while(i<PathSoup.GetNamedTagAsInt("NumberOfObjects"))
					{
					tokens= Str.Tokens(PathSoup.GetNamedTag("object_"+i),",");
					JunctLghtId= JunctionsOfStation.Find(tokens[0],false);

					(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=false;
					i++;
					}

				return true;
				}
		i--;
		}
	return false;
	}



public void MakeAllPathsFromSignal(int stationID, int SignalId)
	{

	JunctionsOfStation=new BinarySortedArrayS();

	JunctionsOfStation.UdgradeArraySize(20);

	string ST_Name1= StationProperties.GetNamedTag("station_name_by_ID"+ stationID);

	string temp121=StationProperties.GetNamedSoup(ST_Name1 +".svetof_soup").GetNamedTag("sv_n^"+SignalId);


	Signal sign1 = cast<Signal>(Router.GetGameObject(temp121));


	Soup tempsoup;
	

	GSTrackSearch GSTS1; 
	MapObject MO;
	MapObject Previous;

	bool TempStrDir;

	bool OtherStation=false;
	
	Junction TempJunction;
	zxSignal TempSignal;
	string signalStation1;
	int signalType;
	Soup Property_soup;
	bool directionRtoStearch;

	int NumberOfObjects;
	int JunctionID1;
	int JunctLghtId;
	string Junct_name2;

	
	string s7564;


	int j, dir2;

	Soup PathSoup1=null;
	

	int NumberOfPaths=0;


	int q=0;
	bool result1=false;
	
	string[] tok99;

	
	while(CheckForTheLastestJunctionFromTheEnd(PathSoup1) and NumberOfPaths<max_path_number)
		{
		Previous=sign1;
		GSTS1 = sign1.BeginTrackSearch(true);
		MO=GSTS1.SearchNext();
		TempStrDir = true;
		if(MO and MO.isclass(Trackside) and !MO.isclass(Junction))
			TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();

		NumberOfObjects=0;
		PathSoup1=Constructors.NewSoup();

		while(MO and !OtherStation)
			{
			string O_name=MO.GetName();
			if(O_name!="" and O_name.size()>3 and O_name[0,4]=="stop")
				OtherStation=true;
			else
				{
				if(MO.isclass(Vehicle) or !MO.isclass(Trackside) or MO.GetName()=="")
					{
					MO=GSTS1.SearchNext();
					TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
					}
				else
					{
					OtherStation=false;
					TempJunction=cast<Junction>MO;
					if(TempJunction)
						{
						JunctionID1=FindJunctionPropertiesId(TempJunction);
						Junct_name2= BSJunctionLib.DBSE[JunctionID1].a;

						//s7564="name "+Junct_name2+" id= "+JunctionID1;
						//Interface.Log(s7564);
	
						JunctLghtId= JunctionsOfStation.Find(Junct_name2,false);

						if(JunctLghtId<0)
							{
							if(JunctionsOfStation.N+20>JunctionsOfStation.DBSE.size())
								JunctionsOfStation.UdgradeArraySize(JunctionsOfStation.DBSE.size()*5);
							

							LightJunctionObject LJO=new LightJunctionObject();
							JunctionsOfStation.AddElement(Junct_name2,cast<GSObject>LJO);
							JunctLghtId= JunctionsOfStation.Find(Junct_name2,false);
							}

				
						if(ThisJPoShorstn(JunctionID1,Previous)) //наша стрелка пошёрстная (возможное верное направление единственно)
							{
							dir2 = TrueJdir(JunctionID1,Previous);

							//s7564="direction "+dir2+" Lid "+JunctLghtId;
							//Interface.Log(s7564);


							(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna=true;
	
							if((cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch) // защита от циклических маршрутов ("мы эту стрелку уже проходили")
								OtherStation=true;
							else
								{
								(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch=true;
					
								if(!dir2)
									(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft=true;
								}
							}
						else		// стрелка противошёрстная
							{
							(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).Poshorstna=false;


							if((cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch) // защита от циклических маршрутов ("мы эту стрелку уже проходили")
								OtherStation=true;
							else
								{
								(cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).ExistedInThisSearch=true;
					
								if((cast<LightJunctionObject>(JunctionsOfStation.DBSE[JunctLghtId].Object)).WasInLeft ) // стрелка в поиске направлена вправо ("влево" уже проверялось)
									{
									if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionID1]).Object)).OldDirection == 2)
										dir2=0; 
									else
										dir2=2;
									}
								else					// ещё не проверялась
									{
									if((cast<JuctionWithProperties>((BSJunctionLib.DBSE[JunctionID1]).Object)).OldDirection == 2)
										dir2=2;
									else
										dir2=0;
									}
								}
							}


						if(!OtherStation)
							{
							int posh_ind=0;
							if(ThisJPoShorstn(JunctionID1,Previous))
								posh_ind=1;

							PathSoup1.SetNamedTag("object_"+NumberOfObjects,Junct_name2+","+dir2+","+posh_ind);						
	
							NumberOfObjects++;
	
							//s7564="prev_ "+Previous.GetName();
							//Interface.Log(s7564);


							MO=MakeSearchByJunctions(JunctionID1,Previous,dir2);

							if(MO)
								{
								//s7564="dir "+dir2+" Obj die "+JunctLghtId+" direction Next = "+GetDirectionByJunctions(JunctionID1,Previous,dir2)+" x_name "+MO.GetName();
								//Interface.Log(s7564);

								if(GetDirectionByJunctions(JunctionID1,Previous,dir2)>=0 )	//если следующая - стрелка, то её направление проверять бесполезно
									{					
									if(GetDirectionByJunctions(JunctionID1,Previous,dir2)==1 )
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
								Previous=TempJunction;
								}
							else
								OtherStation=true;
							}
						}
					else
						{
						TempSignal=cast<zxSignal>MO;
						if(TempSignal)
							{
							signalStation1=TempSignal.stationName;
	
							if(signalStation1!="")
								{
								directionRtoStearch= TempStrDir;

								signalType=TempSignal.Type;

								if(signalType>0 and directionRtoStearch and (signalStation1!=ST_Name1 or signalType&2 ) and signalType&(2+4+8))	//это входной (следующей) станции
									{
									OtherStation=true;
									PathSoup1.SetNamedTag("object_ending",TempSignal.privateName+"@"+signalStation1);
									PathSoup1.SetNamedTag("object_priority",TempSignal.def_path_priority);
									PathSoup1.SetNamedTag("object_Name",TempSignal.GetName());

									PathSoup1.SetNamedTag("object_length",-1.0);
									}
								else
									{
									if(directionRtoStearch and signalType & (2+4+8))
										{
										OtherStation=true;
										PathSoup1.SetNamedTag("object_ending",TempSignal.privateName);
										PathSoup1.SetNamedTag("object_priority",TempSignal.def_path_priority);
										PathSoup1.SetNamedTag("object_Name",TempSignal.GetName());

										GSTS1 = TempSignal.BeginTrackSearch(false);
										MO=GSTS1.SearchNext();
										TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();

										while(MO and !MO.isclass(Junction) and !(MO.isclass(zxSignal) and (  (cast<zxSignal>MO).Type & (2+4+8)  ) )    )
											{
											MO=GSTS1.SearchNext();
											TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
											}
										PathSoup1.SetNamedTag("object_length",GSTS1.GetDistance());
										}
									else
										{
										Previous=MO;
										MO=GSTS1.SearchNext();
										TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
										}
									}
								}
							else
								{
								Previous=MO;
								MO=GSTS1.SearchNext();
								TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
								}
							}
						else
							{
							if(!MO.isclass(Vehicle) and MO.isclass(Trackside) and MO.GetName()!="")
								Previous=MO;					
							MO=GSTS1.SearchNext();
							TempStrDir = GSTS1.GetFacingRelativeToSearchDirection();
							}

						if(GSTS1.GetDistance()>4000 and MO.isclass(Trackside) and !MO.isclass(Vehicle) and !MO.isclass(Junction))
							{
							GSTS1=(cast<Trackside>MO).BeginTrackSearch(TempStrDir);
							}
						}
					}
				}
			}
		PathSoup1.SetNamedTag("NumberOfObjects",NumberOfObjects);

		OtherStation=false;


		tempsoup=Constructors.NewSoup();
		tempsoup.Copy(StationProperties.GetNamedSoup(ST_Name1 +".svetof_soup"));


		int k=0;
		bool notExist=true;



		if(PathSoup1.GetNamedTag("object_ending")!="")
			{
			tempsoup.SetNamedSoup("sv_^"+SignalId+"^"+NumberOfPaths,PathSoup1);
			NumberOfPaths++;


			if(NumberOfPaths > max_path_number)
				Interface.Exception( GetAsset().GetStringTable().GetString("toomuchpaths") );
			
			}


		StationProperties.SetNamedSoup(ST_Name1 +".svetof_soup",tempsoup);


		for(j=0;j<JunctionsOfStation.N;j++)									// обнуляем память о наличии стрелок в маршруте
			(cast<LightJunctionObject>(JunctionsOfStation.DBSE[j].Object)).ExistedInThisSearch=false;
			
		}



	tempsoup=Constructors.NewSoup();
	tempsoup.Copy(StationProperties.GetNamedSoup(ST_Name1 +".svetof_soup"));
	tempsoup.SetNamedTag("sv_paths_number^"+SignalId,NumberOfPaths);
	StationProperties.SetNamedSoup(ST_Name1 +".svetof_soup",tempsoup);

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

int mode=-1; //режим. 


// 0 - непрерывно пытаться собрать маршрут, в том числе переключая перегон
// 1 - непрерывно пытаться собрать маршрут, когда предыдущий маршрут, заданный по этой станции будет замкнут или освобождён
// 2 - маршрут заблокирован (если его принудительно не разбирать, самовосстанавливается)
// 3 - определение возможности немедленной постройки маршрута
// 4 - маневровый маршрут (данным модулем не обрабатывается)

 
int self_state; //состояние 

// 0 - ожидание изменения направления перегона
// 1 - направление перегона верное, скрелки заняты другим маршрутом
// 2 - ожидается изменение направления перегона на следующем шаге
// 3 - маршрут готов к сборке
// 4 - маршрут замкнут


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
				int L_number=PathLib.Find((cast<PathClass>(PathLib.DBSE[i].Object)).linkedpath,false);
				if(L_number >=0 and (cast<PathClass>(PathLib.DBSE[L_number].Object)).self_state != 4)
					{
					(cast<PathClass>(PathLib.DBSE[i].Object)).self_state=1;
					return true;
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


	while(i<JunctionsNumber2)
			{
			tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
			temp_id=BSJunctionLib.Find(tmpstr2[0],false);
							
			(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=Path_nmb;

			(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= OldJunId;

			OldJunId=temp_id;

			if(i==0)
				{
				if( JunctionsNumber2 != 1 )
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos=0;
				else
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos=3;
				}
			else
				{
				if(i==(JunctionsNumber2-1))
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos=2;
				else
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos=1;
				}
	
			if(tmpstr2[2]=="1")
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Poshorstnost=true;
			else
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Poshorstnost=false;

			Jn1 = cast<Junction>Router.GetGameObject( BSJunctionLib.DBSE[temp_id].a );

			if(!Jn1.SetDirection(Str.ToInt(tmpstr2[1])))
				{
				Jn1.AllowManualControl(true);

				Jn1.SetDirection(Str.ToInt(tmpstr2[1]));
				}
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

	
	if(MO and !MO.isclass(Junction) )
		{
		GSTrackSearch GSTS2= GSTS1.CloneSearch();
		bool dir1 = GSTS1.GetFacingRelativeToSearchDirection();


		MapObject MO2 = MO;


		while(MO2 and !MO2.isclass(Junction) and !( MO2.isclass(zxSignal) and !dir1  and ((cast<zxSignal>MO2).Type & (zxSignal.ST_IN+zxSignal.ST_OUT+zxSignal.ST_ROUTER))  ) )
			{
			MO2 = GSTS2.SearchNext();
			dir1 = GSTS2.GetFacingRelativeToSearchDirection();
			}

		if(MO2 and  MO2.isclass(zxSignal) )
			{
			(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal = MO2.GetName();
			(cast<zxSignal>MO2).AttachedJunction = tmpstr2[0];
			}
		}



	if(MO and MO.isclass(Trigger) and MO.GetProperties().GetNamedTagAsBool("zxPath_can_lock",false))
		{
		//Interface.Log("obj_founded !!!!");
		Soup OldProp=MO.GetProperties();
		OldProp.SetNamedTag("zxPath_lock",Path_nmb);
		MO.SetProperties(OldProp);
		}


// открываем светофор


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

	int tempNumber,temp_id;
	
	string[] tmpstr2;

	int JunctionsNumber1=sp1.GetNamedTagAsInt("NumberOfObjects",0);

	if(JunctionsNumber1!=0)
		{	
		int i=0;
		while(i<JunctionsNumber1)	// определение свободности стрелок
			{
			tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
			temp_id=BSJunctionLib.Find(tmpstr2[0],false);
		
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

	int path_nmb=PathLib.Find(PathName,false);
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
				temp_id=BSJunctionLib.Find( MO.GetName(),false);

				if((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done == path_abs_nmb)
					{
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=0;
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
					int dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).OldDirection;
					(cast<Junction>Router.GetGameObject(BSJunctionLib.DBSE[temp_id].a)).SetDirection(dir1);	

					if( (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal != "")
						{
						string sign3 = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal;
						zxSignal MO3 = cast<zxSignal>( Router.GetGameObject(sign3) );
						if(MO3)
							MO3.AttachedJunction = "";
						
						(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal = "";
						}
					}
				else
					other_path = true;

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
	string end_obj=sp1.GetNamedTag("object_ending");
	string[] tookens= Str.Tokens(end_obj,"@");
	if(tookens.size()==2)
		return true;

	return false;
	}



public bool SpanDirectedCorrectly(string ST_name, int SignalId, int pathN)
	{
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);

	string end_obj=sp1.GetNamedTag("object_ending");
	string[] tookens= Str.Tokens(end_obj,"@");

	if(tookens.size()==2)	// светофор принадлежит другой станции
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

	string end_obj=sp1.GetNamedTag("object_ending");
	string[] tookens= Str.Tokens(end_obj,"@");

	if(tookens.size()==2)	// светофор принадлежит другой станции
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
					int temp_id3=BSJunctionLib.Find(MO8.GetName(),false);
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


public bool Any_Lock(int id1, int dir1, bool poshorstn,int i,int num, bool poeznoi, bool remove)
	{
	GSTrackSearch GSTS;
	MapObject MO1;

	if( TrainzScript.GetTrainzVersion() < 3.7 )
		{
		JuctionWithProperties JWP = cast<JuctionWithProperties>((BSJunctionLib.DBSE[id1]).Object);
		MapObject MO0;
		int str_dir;
				
		if(poshorstn)
			{
			//left/right

			if(dir1==0)
				{
				MO0=JWP.frontLeft;
				str_dir=JWP.frontLeft_dir;
				}							
			else
				{
				MO0=JWP.frontRight;
				str_dir=JWP.frontRight_dir;
				}
			}
		else
			{
			//back
						
			MO0=JWP.back;
			str_dir=JWP.back_dir;
			}


		if(!MO0)
			return true;

		if(!MO0.isclass(Junction))
			{

			GSTS=(cast<Trackside>MO0).BeginTrackSearch((bool)str_dir);
			MO1=MO0;

			if(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)>=0  and !remove )
				return true;

			if(i==0)
				{
				if(poeznoi)
					{
					bool any_train = false;
					bool dir2 = (bool)str_dir;


					while(!MO1.isclass(Junction) and !(MO1.isclass(Signal)  and !dir2 and ( MO1.GetProperties().GetNamedTagAsInt("GetSignalType()",1) & (2+4+8) )  ))
						{
						MO1=GSTS.SearchNext();
						dir2 = GSTS.GetFacingRelativeToSearchDirection();
	
						if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove) )
							any_train = true;	
						}
	
					if(MO1.isclass(Signal))
						{
						if(any_train)
							return true;
						}
					else
						return false;
					}
				else
					{
					while(!MO1.isclass(Junction) and !MO1.isclass(Signal))
						{
						MO1=GSTS.SearchNext();
						if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove) )
							return true;	
						}
					}
				}
			else
				{
				while(!MO1.isclass(Junction))
					{
					MO1=GSTS.SearchNext();
					if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0  or remove) )
						return true;	
					}
				}


			GSTS=(cast<Trackside>MO0).BeginTrackSearch(!(bool)str_dir);
			MO1=MO0;
			while(MO1 and !MO1.isclass(Junction) and !MO1.isclass(Vehicle))
				{
				MO1=GSTS.SearchNext();
				if(MO1.isclass(Vehicle) or (MO1.isclass(Trigger) and !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove) ) )
					return true;	
				}
			}
		}
	else
		{
		Junction JN2 = cast<Junction>Router.GetGameObject( (BSJunctionLib.DBSE[id1]).a );

		JunctionBase JN = cast<JunctionBase>(JN2);

	
		if(poshorstn)	//left/right
			GSTS=JN.BeginTrackSearch(dir1);
		else		//back
			GSTS=JN.BeginTrackSearch(JunctionBase.DIRECTION_BACKWARD);
			

		MO1=GSTS.SearchNext();
	
		if(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)>=0  and !remove )
			return true;

		if(i==0)
			{
			if(poeznoi)
				{
				bool any_train = false;
			

				while(!MO1.isclass(Junction)  and !(MO1.isclass(Signal)  and !GSTS.GetFacingRelativeToSearchDirection() and ( MO1.GetProperties().GetNamedTagAsInt("GetSignalType()",1) & (2+4+8) )  ))
					{
					MO1=GSTS.SearchNext();
	
					if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove) )
						any_train = true;	
					}

				if(MO1.isclass(Signal))
					{
					if(any_train)
						return true;
					}
				else
					return false;
				}
			else
				{
				while(!MO1.isclass(Junction) and !MO1.isclass(Signal))
					{
					MO1=GSTS.SearchNext();

					if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0 or remove) )
						return true;	
					}
				}
			}
		else
			{
			while( !MO1.isclass(Junction) )
				{
				MO1=GSTS.SearchNext();


				if(MO1.isclass(Vehicle) or !(MO1.GetProperties().GetNamedTagAsInt("zxPath_lock",-1)<0  or remove) )
					return true;	
				}
			}

		// проверка освобождения ближайших к стрелке участков пути


		float min_dist; 

		if(poshorstn)
			{	
			GSTS=JN.BeginTrackSearch(JunctionBase.DIRECTION_BACKWARD);

			min_dist = 1;
			}
		else	
			{	
			GSTS=JN.BeginTrackSearch(dir1);

			min_dist = 48;
			}

		MO1= cast<MapObject>JN2;

		while(MO1 and GSTS.GetDistance() < (min_dist+30))
			{
			MO1=GSTS.SearchNext();
			if(MO1 and MO1.isclass(Vehicle) and GSTS.GetDistance() < (min_dist+(cast<Vehicle>MO1).GetLength()/2) )
				return true;	
			}
		}



	if(i==(num-1) and poeznoi)
		{
		return Any_Lock(id1,dir1,!poshorstn,0,(num+1),poeznoi, remove );
		}



	return false;
	}




bool CheckJunctionsAreFree(string ST_name, int SignalId, int pathN)
	{
	GSTrackSearch GSTS_temp;

	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sv_sp2;
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	int i;

	string end_obj=sp1.GetNamedTag("object_ending");

	string[] tookens= Str.Tokens(end_obj,"@");


	zxSignal sign1, sign2;
	int tempNumber,temp_id;
	int dir;

	string[] tmpstr2;

	if(tookens.size()==2)	// светофор принадлежит другой станции
		{
		sv_sp2=StationProperties.GetNamedSoup(tookens[1] +".svetof_soup");
		if(sv_sp2)
			{
			int JunctionsNumber1=sp1.GetNamedTagAsInt("NumberOfObjects",0);

			if(JunctionsNumber1==0)
				{
				return true;
				}

			i=0;

			while(i<JunctionsNumber1)	// определение свободности стрелок
				{
				tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
				temp_id=BSJunctionLib.Find(tmpstr2[0],false);
				dir=Str.ToInt(tmpstr2[1]);
				
				if(Any_Lock(temp_id,dir, tmpstr2[2]=="1",i,JunctionsNumber1,true, false))
					return false;

				if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done)!=0)
					return false;
				i++;		
				}

			return true;
			}
		return false;
		}
	else				// маршрут по станции
		{
		sv_sp2=StationProperties.GetNamedSoup(ST_name +".svetof_soup");

		if(sv_sp2)
			{
			string svetofor_Mname=sp1.GetNamedTag("object_Name");

			sign1 = cast<zxSignal>(Router.GetGameObject(svetofor_Mname));	
			if(!sign1)
				return false;
			
			// проверка занятости самого парка


			GSTS_temp=sign1.BeginTrackSearch(false);
			MapObject MO8=GSTS_temp.SearchNext();

			if(MO8.isclass(Vehicle))
				return false;

			while(MO8 and !MO8.isclass(Junction))
				{
				if(MO8.isclass(Vehicle))
					return false;
				MO8=GSTS_temp.SearchNext();
				}

// проверка открытости выходного светофора или занятости первой стрелки за ним: если она занята и направлена на нас, парк занят


			if(sign1.MainState == 0 or sign1.MainState == 1 or sign1.MainState == 2)
				{
				GSTS_temp= sign1.BeginTrackSearch(true);
				MapObject MO=GSTS_temp.SearchNext();
				MapObject prev=sign1;

				

				while(MO and !MO.isclass(Junction)) 
					{
					if(MO.isclass(Vehicle))
						return false;
					if(MO.GetName()!="" and MO.isclass(Trackside))
						prev=MO;
					MO=GSTS_temp.SearchNext();
					}


				Junction J453=cast<Junction>MO;

				if(J453)
					{
					int j_id1= BSJunctionLib.Find(J453.GetName(),false);
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

			i=0;
			

			while(i<JunctionsNumber1)	// определение свободности стрелок
				{
				tmpstr2=Str.Tokens(sp1.GetNamedTag("object_"+i),",");
				temp_id=BSJunctionLib.Find(tmpstr2[0],false);
				dir=Str.ToInt(tmpstr2[1]);

				if(Any_Lock(temp_id,dir,tmpstr2[2]=="1",i,JunctionsNumber1,true, false))
					return false;

				if(((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done)!=0)
					return false;
		
				i++;		
				}
					
			return true;	
			}
		}
	return false;
	}


public void MainChecker(void)
	{
	RemovePath(CancelPath);

	int i=0;
	while(i<PathLib.N)
		{
		if(CheckPath(i))
			i++;
		}
	PostMessage(me,"z7-xPath", "Update",0.0);
	}




public bool CheckPathIsFree(string ST_name, int SignalId, int pathN) 
	{
	bool result=true;
	int MyCurrentPath=CurrentPath;
	CurrentPath++;

	PathClass PCS1=new PathClass();
			
	if(PathLib.N< (CurrentPath+30))
		PathLib.UdgradeArraySize(PathLib.N*2);

	PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);

	int number8=PathLib.Find(MyCurrentPath,false);
			
	
	Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	Soup sp1= sv_sp.GetNamedSoup("sv_^"+SignalId+"^"+pathN);
	string end_obj=sp1.GetNamedTag("object_ending");

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
			
	if(PathLib.N< (CurrentPath+30))
		PathLib.UdgradeArraySize(PathLib.N*2);

	PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);

	int number8=PathLib.Find(MyCurrentPath,false);

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
			
	if(PathLib.N< (CurrentPath+30))
		PathLib.UdgradeArraySize(PathLib.N*2);

	PathLib.AddElement(MyCurrentPath,cast<GSObject>PCS1);

	int number8=PathLib.Find(MyCurrentPath,false);
			


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



void LeavingHandler1(Message msg)
	{
	GameObject GO=cast<GameObject>(msg.dst);
	string junct_name=GO.GetName();	

	if(GO.isclass(Junction))
		{
		int temp_id=BSJunctionLib.Find(junct_name,false);

		if(temp_id<0)
			return;




		if((TrainzScript.GetTrainzVersion() < 3.7 and msg.minor=="Leave") or (TrainzScript.GetTrainzVersion() >= 3.7 and msg.minor=="InnerLeave") )	
			{
// разборка маршрута по освобождению стрелки

			int Path_tmp_nmb=(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done;


			if((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos!=0 and (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos!=3)
				{
				int other_jn = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction;
				if(other_jn>=0)
					{
					if( (cast<JuctionWithProperties>(BSJunctionLib.DBSE[other_jn].Object)).Permit_done ==  Path_tmp_nmb)	// если предыдущая стрелка маршрута не освобождена, эта тоже не может освободиться
						return;
					}
				}

			
			int p_element_n=PathLib.Find(Path_tmp_nmb,false);

			if(p_element_n>=0 and (cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode>=0)
				{

				bool poeznoi = true;

				int mode1 = (cast<PathClass>(PathLib.DBSE[p_element_n].Object)).mode;

				if(mode1 == 4)
					poeznoi = false;

				
				int pos = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).JunctPos;



				if( ((cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal != "") and msg.src.isclass(Train) )				// последняя стрелка поездного маршрута разбирается светофором
					return;
				else
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).LinkedSignal = "";


				int num_jun = 3;


				if(pos == 3)
					{
					pos = 0;
					num_jun = 1;
					}


				

				bool result = !Any_Lock(temp_id ,  (cast<Junction>GO).GetDirection() , (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Poshorstnost, pos,num_jun, poeznoi,true);


				if(result)
					{
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=0;
					(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
					int dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).OldDirection;
					(cast<Junction>Router.GetGameObject(BSJunctionLib.DBSE[temp_id].a)).SetDirection(dir1);	
					}
				}
			else
				{
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=0;
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
				int dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).OldDirection;
				(cast<Junction>GO).SetDirection(dir1);	
				}

			MainChecker();		//проверка		

			}
		if(msg.minor=="InnerEnter" and (cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done==0)
			{
			(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).PrevJunction= -1;
			(cast<JuctionWithProperties>(BSJunctionLib.DBSE[temp_id].Object)).Permit_done=1;
			}
		}


	if(GO.isclass(Trigger) and msg.minor=="Leave")
		{
		Soup OldProp=(cast<Trigger>GO).GetProperties();
		if(OldProp.GetNamedTagAsBool("zxPath_can_lock",false))
			{
			OldProp.SetNamedTag("zxPath_lock",-1);
			(cast<Trigger>GO).SetProperties(OldProp);
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




public thread void InitPathCleaner()
	{
	Sleep(4);
	Junction[] j_list4=World.GetJunctionList();

	int i;
	for(i=0;i<j_list4.size();i++)
		Sniff(j_list4[i],"Object", "",true);

	AddHandler(me,"Object", "","LeavingHandler1");

	setSettings();
	}



};




